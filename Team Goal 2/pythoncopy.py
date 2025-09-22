import os
import numpy as np
from sentence_transformers import SentenceTransformer
import requests
from docx import Document
import pdfplumber
from PIL import Image
import pytesseract

from flask import Flask, render_template, request, jsonify

app = Flask(__name__, template_folder="templates", static_folder="static")

# ----------- Step 1: Get repo files and build context at startup -----------

repo_path = "TG--Web-UI"
file_types = [".py", ".md", ".txt", ".html", ".pdf", ".docx", ".png", ".jpg", ".jpeg"]

def extract_docx_text(path):
    doc = Document(path)
    return "\n\n".join([p.text for p in doc.paragraphs if p.text.strip()])

def extract_pdf_text(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_txt = page.extract_text()
            if page_txt:
                text += page_txt + "\n\n"
    return text

def extract_image_text(path):
    return pytesseract.image_to_string(Image.open(path))

def get_files(repo_path, file_types):
    all_files = []
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if any(file.endswith(ext) for ext in file_types):
                all_files.append(os.path.join(root, file))
    return all_files

def load_file_content(files):
    docs = []
    for file_path in files:
        try:
            ext = os.path.splitext(file_path)[1].lower()
            if ext in [".txt", ".md", ".py", ".html"]:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    docs.append(f.read())
            elif ext == ".docx":
                docs.append(extract_docx_text(file_path))
            elif ext == ".pdf":
                docs.append(extract_pdf_text(file_path))
            elif ext in [".png", ".jpg", ".jpeg"]:
                docs.append(extract_image_text(file_path))
            else:
                docs.append("")  # Unknown, skip
        except Exception as e:
            docs.append("")
    return docs


# --------- Chunking ---------
def chunk_text_by_paragraph(text, file_path):
    import re
    paragraphs = re.split(r'\n\s*\n', text)
    chunks = []
    for para in paragraphs:
        para = para.strip()
        if para:
            chunk_text = f"{file_path}: {para}"
            chunks.append(chunk_text)
    return chunks

files = get_files(repo_path, file_types)
docs = load_file_content(files)

chunked_docs = []
for file_path, doc in zip(files, docs):
    chunks = chunk_text_by_paragraph(doc, file_path)
    chunked_docs.extend(chunks)
print(f"Total lines (chunks): {len(chunked_docs)}")

# --------- Embedding ---------
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(chunked_docs, show_progress_bar=True)
print("Embeddings shape:", embeddings.shape)

# ----------- Retrieval and QA functions -----------

def retrieve_context(query, model, embeddings, chunked_docs, top_k=5):
    query_emb = model.encode([query])[0]
    scores = np.dot(embeddings, query_emb)
    top_indices = np.argsort(scores)[-top_k:][::-1]
    return [chunked_docs[i] for i in top_indices]

def ask_llama3(context, question):
    prompt = f"Use the following context to answer the question.\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer:"
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )
    return response.json()["response"].strip()

# ----------- Flask Endpoints -----------

#             To reference the Home page
@app.route('/Home.html')
def home():
    return render_template('Home.html')

#             To reference the login page
@app.route('/ACELogin.html')
def login():
    return render_template('ACELogin.html')

#             To reference the frontend request
@app.route('/api/rag', methods=['POST'])
def rag_api():
    data = request.get_json()
    query = data.get('query', '')
    relevant_chunks = retrieve_context(query, model, embeddings, chunked_docs, top_k=5)
    context = "\n".join(relevant_chunks)
    answer = ask_llama3(context, query)
    # Collect referenced files
    referenced_files = []
    for chunk in relevant_chunks:
        if ':' in chunk:
            file_path = chunk.split(':', 1)[0]
            referenced_files.append(file_path.strip())
        else:
            referenced_files.append(chunk.strip())
    return jsonify({
        'llm_answer': answer,
        'referenced_files': referenced_files,
        'referenced_context': relevant_chunks
    })

#             To reference viewing file content
@app.route('/api/file')
def get_file():
    file_path = request.args.get('path')
    if not file_path or not os.path.isfile(file_path):
        return jsonify({'error': 'File not found'}), 404
    ext = os.path.splitext(file_path)[1].lower()
    # Binary files
    if ext in [".png", ".jpg", ".jpeg", ".pdf"]:
        return send_file(file_path)
    # DOCX: for download only
    if ext == ".docx":
        return send_file(file_path)
    # HTML as plain text
    if ext == ".html":
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        return content, 200, {'Content-Type': 'text/plain; charset=utf-8'}
    # Text/code files
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    return content, 200, {'Content-Type': 'text/plain; charset=utf-8'}

if __name__ == '__main__':
    app.run(debug=True)