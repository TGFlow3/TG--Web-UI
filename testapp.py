
import os
import numpy as np
from sentence_transformers import SentenceTransformer
import requests
from docx import Document
import pdfplumber
from PIL import Image
import pytesseract
import faiss
from flask_cors import CORS
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
CORS(app)

repo_path = "C:\\Users\\traly\\OneDrive\\Documents\\WindowsPowerShell\\Notes\\LLM's"
file_types = [".py", ".md", ".txt", ".html", ".pdf", ".docx", ".png", ".jpg", ".jpeg"]

def get_files(repo_path, file_types):
    all_files = []
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if any(file.endswith(ext) for ext in file_types):
                all_files.append(os.path.join(root, file))
    return all_files

def load_file_objects(files):
    file_objs = []
    for file_path in files:
        try:
            f = open(file_path, "rb")  # or "r" for text files
            file_objs.append(f)
        except Exception as e:
            file_objs.append(None)
    return file_objs
files = get_files(repo_path, file_types)
file_objects = load_file_objects(files)
print(f"Number of files loaded: {len(file_objects)}")


# --------- Chunking ---------
def chunk_text_by_line(text, file_path):
    lines = text.split('\n')
    chunks = []
    for line in lines:
        line = line.strip()
        if line:
            chunk_text = f"{file_path}: {line}"
            chunks.append(chunk_text)
    return chunks

chunked_docs = []
for file_path, file_obj in zip(files, file_objects):
    if file_obj is not None:
        try:
            text = file_obj.read().decode('utf-8', errors='ignore')
        except Exception:
            try:
                file_obj.seek(0)
                text = file_obj.read().decode('latin-1', errors='ignore')
            except Exception:
                text = ''
        chunks = chunk_text_by_line(text, file_path)
        chunked_docs.extend(chunks)
        file_obj.close()
    else:
        continue
print(f"Total lines (chunks): {len(chunked_docs)}")

# --------- Embedding ---------
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(chunked_docs, show_progress_bar=True)
print("Embeddings shape:", embeddings.shape)

# Convert embeddings to numpy array if not already
embeddings_np = np.array(embeddings).astype('float32')

# Create FAISS index
index = faiss.IndexFlatL2(embeddings_np.shape[1])  # L2 distance
index.add(embeddings_np)

# Save index to disk
faiss.write_index(index, "faiss_index.idx")
print("FAISS index saved as faiss_index.idx")


def query_llm_with_context(query, model, index, chunked_docs, top_k=5):
    # Step 1: Retrieve relevant chunks from FAISS
    query_embedding = model.encode([query]).astype('float32')
    D, I = index.search(query_embedding, k=top_k)
    results = [chunked_docs[i] for i in I[0]]
    context = "\n".join(results)

    # Step 2: Send context and query to Ollama
    prompt = f"Use the following context to answer the question.\n\nContext:\n{context}\n\nQuestion: {query}\n\nAnswer:"
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )
    answer = response.json().get("response", "No answer returned.").strip()
    return answer

# Example usage:
#answer = query_llm_with_context("What about getting to know elon musk?", model, index, chunked_docs, top_k=5)
#print("LLM Answer:", answer)

# Flask API endpoint for RAG workflow
@app.route('/rag_query', methods=['POST'])
def rag_query():
    data = request.get_json()
    query = data.get('query')
    if not chunked_docs or not isinstance(chunked_docs, list) or len(chunked_docs) == 0:
        return jsonify({'error': 'No documents available for retrieval.'}), 400
    if not query or not isinstance(query, str):
        return jsonify({'error': 'Query is missing or invalid.'}), 400


# Retrieve relevant chunks
    query_embedding = model.encode([query]).astype('float32')
    D, I = index.search(query_embedding, k=5)
    results = [chunked_docs[i] for i in I[0]]

    # Extract filenames from chunked_docs (assuming format: "filepath: line")
    filenames = []
    for chunk in results:
        filename = chunk.split(': ', 1)[0]
        filenames.append(filename)

    #Get LLM answer
    answer = query_llm_with_context(query, model, index, chunked_docs, top_k=5)
    return jsonify({'response': answer, 'filenames': filenames})



if __name__ == '__main__':
    app.run(debug=True)

