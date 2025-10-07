from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
from docx import Document
import pdfplumber
from PIL import Image
import pytesseract
import io
import requests
import os
import re
from datetime import datetime
import numpy as np
import hashlib
import json
from collections import defaultdict, deque

# --- Flask app ---
app = Flask(__name__)
CORS(app)

# --- GitHub Repo Config ---
GITHUB_OWNER = "TGFlow3"
GITHUB_REPO = "TG_Webapp"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_BRANCH = "main"
file_types = [".py", ".md", ".txt", ".html", ".pdf", ".docx", ".png", ".jpg", ".jpeg"]

# --- GitHub API File Listing and Loading ---
def list_github_files(owner, repo, token, path="", branch="main"):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    params = {"ref": branch}
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    items = response.json()
    files = []
    for item in items:
        if item["type"] == "file":
            if any(item["name"].endswith(ext) for ext in file_types):
                files.append(item)
        elif item["type"] == "dir":
            files.extend(list_github_files(owner, repo, token, item["path"], branch))
    return files
files = list_github_files(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, branch=GITHUB_BRANCH)
print(f"Loaded {len(files)} files from GitHub repository {GITHUB_OWNER}/{GITHUB_REPO}.")


def download_and_extract_text(file, token):
    ext = os.path.splitext(file["name"])[1].lower()
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    resp = requests.get(file["download_url"], headers=headers)
    resp.raise_for_status()
    content_bytes = resp.content
    text = None
    try:
        if ext in [".txt", ".md", ".py", ".html"]:
            text = content_bytes.decode('utf-8', errors='ignore')
        elif ext == ".pdf":
            with pdfplumber.open(io.BytesIO(content_bytes)) as pdf:
                text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
        elif ext == ".docx":
            doc = Document(io.BytesIO(content_bytes))
            text = '\n'.join(p.text for p in doc.paragraphs)
        elif ext in [".png", ".jpg", ".jpeg"]:
            img = Image.open(io.BytesIO(content_bytes))
            text = pytesseract.image_to_string(img)
    except Exception as e:
        text = None
    return text, ext

# --------- Enhanced Chunking ---------
def intelligent_chunk_text(text, file_info, chunk_size=300, overlap=50):
    """
    Intelligent chunking that respects document structure and content type
    """
    file_path = file_info['path']
    extension = os.path.splitext(file_info['name'])[1].lower()
    chunks = []
    # Code files - chunk by logical blocks
    if extension in ['.py', '.js', '.html', '.css', '.json']:
        chunks = chunk_code_file(text, file_info, chunk_size)
    # Markdown - chunk by sections
    elif extension == '.md':
        chunks = chunk_markdown_file(text, file_info, chunk_size)
    # Other text files - semantic chunking
    else:
        chunks = chunk_text_semantically(text, file_info, chunk_size, overlap)
    return chunks

def chunk_code_file(text, file_info, chunk_size=300):
    """Chunk code files by functions, classes, and logical blocks"""
    extension = os.path.splitext(file_info['name'])[1].lower()
    chunks = []
    lines = text.split('\n')
    current_chunk = []
    current_size = 0
    current_context = ""
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if not line_stripped or line_stripped.startswith('#') or line_stripped.startswith('//'):
            current_chunk.append(line)
            continue
        if extension == '.py':
            if line_stripped.startswith('def ') or line_stripped.startswith('class '):
                current_context = line_stripped
                if current_chunk:
                    chunk_text = create_chunk_with_metadata(current_chunk, file_info, i-len(current_chunk), current_context)
                    chunks.append(chunk_text)
                current_chunk = [line]
                current_size = len(line)
                continue
        current_chunk.append(line)
        current_size += len(line)
        if current_size > chunk_size and len(current_chunk) > 5:
            chunk_text = create_chunk_with_metadata(current_chunk, file_info, i-len(current_chunk)+1, current_context)
            chunks.append(chunk_text)
            current_chunk = []
            current_size = 0
    if current_chunk:
        chunk_text = create_chunk_with_metadata(current_chunk, file_info, len(lines)-len(current_chunk), current_context)
        chunks.append(chunk_text)
    return chunks

def chunk_markdown_file(text, file_info, chunk_size=300):
    """Chunk markdown files by headers and sections"""
    chunks = []
    sections = re.split(r'\n(?=#{1,6}\s)', text)
    for section in sections:
        if section.strip():
            if len(section) > chunk_size:
                subsections = chunk_text_semantically(section, file_info, chunk_size, 50)
                chunks.extend(subsections)
            else:
                chunk_text = create_chunk_with_metadata([section], file_info, 0, "markdown_section")
                chunks.append(chunk_text)
    return chunks

def chunk_text_semantically(text, file_info, chunk_size=300, overlap=50):
    """Semantic chunking for general text files"""
    chunks = []
    paragraphs = text.split('\n\n')
    current_chunk = []
    current_size = 0
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        if len(paragraph) > chunk_size:
            sentences = re.split(r'[.!?]+', paragraph)
            for sentence in sentences:
                if sentence.strip():
                    current_chunk.append(sentence.strip() + '.')
                    current_size += len(sentence)
                    if current_size > chunk_size:
                        chunk_text = create_chunk_with_metadata(current_chunk, file_info, 0, "text_content")
                        chunks.append(chunk_text)
                        if len(current_chunk) > 2:
                            current_chunk = current_chunk[-2:]
                            current_size = sum(len(s) for s in current_chunk)
                        else:
                            current_chunk = []
                            current_size = 0
        else:
            current_chunk.append(paragraph)
            current_size += len(paragraph)
            if current_size > chunk_size:
                chunk_text = create_chunk_with_metadata(current_chunk, file_info, 0, "text_content")
                chunks.append(chunk_text)
                current_chunk = []
                current_size = 0
    if current_chunk:
        chunk_text = create_chunk_with_metadata(current_chunk, file_info, 0, "text_content")
        chunks.append(chunk_text)
    return chunks

def create_chunk_with_metadata(content_lines, file_info, line_start, context=""):
    content = '\n'.join(content_lines) if isinstance(content_lines, list) else content_lines
    chunk_data = {
        'content': content,
        'file_path': file_info['path'],
        'file_name': file_info['name'],
        'file_type': os.path.splitext(file_info['name'])[1].lower(),
        'file_size': file_info.get('size', 0),
        'line_start': line_start,
        'context': context,
        'chunk_size': len(content),
        'created_at': datetime.now().isoformat()
    }
    searchable_text = f"File: {file_info['path']}\nType: {os.path.splitext(file_info['name'])[1].lower()}\nContext: {context}\nContent: {content}"
    return {
        'text': searchable_text,
        'metadata': chunk_data
    }




# --------- Process and Chunk All Files ---------
processed_chunks = []
processing_stats = {
    'successful': 0,
    'failed': 0,
    'total_chunks': 0,
    'by_type': {}
}

for file_info in files:
    text, ext = download_and_extract_text(file_info, GITHUB_TOKEN)
    if text is None:
        print(f" ❌ Failed to extract text from {file_info['name']}")
        processing_stats['failed'] += 1
        continue
    # Chunk the text intelligently
    try:
        chunks = intelligent_chunk_text(text, file_info)
        processed_chunks.extend(chunks)
        # Update statistics
        processing_stats['successful'] += 1
        processing_stats['total_chunks'] += len(chunks)
        file_type = os.path.splitext(file_info['name'])[1].lower()
        if file_type not in processing_stats['by_type']:
            processing_stats['by_type'][file_type] = {'files': 0, 'chunks': 0}
        processing_stats['by_type'][file_type]['files'] += 1
        processing_stats['by_type'][file_type]['chunks'] += len(chunks)
        print(f" ✅ {file_info['name']} split into {len(chunks)} chunks.")
    except Exception as e:
        print(f" ❌ Chunking failed for {file_info['name']}: {str(e)}")
        processing_stats['failed'] += 1
        continue

# Extract just the text for embedding (keep metadata separate)
chunked_docs = [chunk['text'] for chunk in processed_chunks]
chunk_metadata = [chunk['metadata'] for chunk in processed_chunks]

print(f"\n📊 Processing Summary:")
print(f"✅ Successfully processed: {processing_stats['successful']} files")
print(f"❌ Failed to process: {processing_stats['failed']} files")
print(f"📝 Total chunks created: {processing_stats['total_chunks']}")
print(f"\n📁 By file type:")
for file_type, stats in processing_stats['by_type'].items():
    print(f"  {file_type}: {stats['files']} files → {stats['chunks']} chunks")

# --------- Enhanced Embedding & Indexing ---------
print("\n🔢 Creating embeddings...")

# Deduplication - remove exact duplicate chunks
unique_chunks = []
seen_hashes = set()
original_count = len(chunked_docs)

for i, (chunk_text, metadata) in enumerate(zip(chunked_docs, chunk_metadata)):
    # Create hash of content for deduplication
    content_hash = hashlib.md5(chunk_text.encode()).hexdigest()
    
    if content_hash not in seen_hashes:
        seen_hashes.add(content_hash)
        unique_chunks.append((chunk_text, metadata))

print(f"📉 Deduplication: {original_count} → {len(unique_chunks)} chunks (removed {original_count - len(unique_chunks)} duplicates)")

# Extract deduplicated data
chunked_docs = [chunk[0] for chunk in unique_chunks]
chunk_metadata = [chunk[1] for chunk in unique_chunks]

# Use a better embedding model for better semantic understanding
model = SentenceTransformer("all-MiniLM-L6-v2")  # Consider upgrading to "all-mpnet-base-v2" for better quality
print(f"🤖 Using embedding model: {model.get_sentence_embedding_dimension()} dimensions")

# Create embeddings with progress tracking
embeddings = model.encode(chunked_docs, show_progress_bar=True, batch_size=32)
print(f"📏 Embeddings shape: {embeddings.shape}")

# Convert to numpy array
embeddings_np = np.array(embeddings).astype('float32')

# Create enhanced FAISS index with IVF for better performance on large datasets
dimension = embeddings_np.shape[1]
if len(embeddings_np) > 1000:
    # Use IVF index for better search performance
    nlist = min(100, len(embeddings_np) // 10)  # Number of clusters
    quantizer = faiss.IndexFlatL2(dimension)
    index = faiss.IndexIVFFlat(quantizer, dimension, nlist)
    index.train(embeddings_np)
    print(f"🏗️  Created IVF index with {nlist} clusters")
else:
    # Use simple flat index for small datasets
    index = faiss.IndexFlatL2(dimension)
    print("🏗️  Created flat L2 index")

index.add(embeddings_np)

# Save index and metadata
faiss.write_index(index, "faiss_index.idx")
with open("chunk_metadata.json", "w") as f:
    json.dump(chunk_metadata, f, indent=2)

print("💾 Saved:")
print("  - faiss_index.idx (vector index)")
print("  - chunk_metadata.json (chunk metadata)")
print(f"🚀 RAG system ready with {len(chunked_docs)} searchable chunks!")

# Conversation memory: maps session_id to a deque of (query, answer, entities, topics) tuples
conversation_memory = defaultdict(lambda: deque(maxlen=8))  # Last 8 turns per session
# Session context: maps session_id to user/project/session info
session_context = defaultdict(dict)

def extract_entities_and_topics(text):
    # Simple entity/topic extraction: capitalized words and keywords
    import re
    entities = set(re.findall(r'\b[A-Z][a-zA-Z0-9_]+\b', text))
    keywords = set(re.findall(r'\b\w{5,}\b', text.lower()))
    return list(entities), list(keywords)

def resolve_pronouns(query, session_id):
    # Replace pronouns with last mentioned entity/topic if possible
    history = list(conversation_memory[session_id])
    if not history:
        return query
    last_entities = []
    for h in reversed(history):
        if h[2]:  # entities
            last_entities = h[2]
            break
    if last_entities:
        for pronoun in ['it', 'this', 'that', 'they', 'them', 'those']:
            if pronoun in query.lower():
                query = re.sub(rf'\b{pronoun}\b', last_entities[-1], query, flags=re.IGNORECASE)
    return query

def build_contextual_query(query, session_id):
    """Expand the query with recent conversation turns, resolve pronouns, and add session context."""
    # 1. Resolve pronouns
    query = resolve_pronouns(query, session_id)
    # 2. Add last 3 Q&A pairs
    history = list(conversation_memory[session_id])
    context = ""
    if history:
        context = "\n".join([f"Q: {q}\nA: {a}" for q, a, _, _ in history[-3:]])
    # 3. Add session/project context if available
    session_info = session_context[session_id]
    session_info_str = ""
    if session_info:
        session_info_str = "\n".join([f"{k}: {v}" for k, v in session_info.items()])
    # 4. Compose expanded query
    expanded = ""
    if session_info_str:
        expanded += f"Session info:\n{session_info_str}\n"
    if context:
        expanded += f"Recent conversation:\n{context}\n"
    expanded += f"Current question: {query}"
    return expanded

def query_llm_with_context(query, model, index, chunked_docs, session_id, top_k=1):
    # Step 1: Build context-aware query
    contextual_query = build_contextual_query(query, session_id)
    # Step 2: Retrieve relevant chunks from FAISS
    query_embedding = model.encode([contextual_query]).astype('float32')
    D, I = index.search(query_embedding, k=top_k)
    results = [chunked_docs[i] for i in I[0]]
    context = "\n".join(results)
    # Step 3: (Optional) Retrieve related chunks (document context)
    related_chunks = []
    for idx in I[0]:
        meta = None
        if idx < len(chunk_metadata):
            meta = chunk_metadata[idx]
            # Find other chunks from same file (simple heuristic)
            related = [c['text'] for c in processed_chunks if c['metadata']['file_path'] == meta['file_path'] and c['text'] not in results]
            related_chunks.extend(related[:1])  # Add one related chunk per result
    if related_chunks:
        context += "\n\nRelated context:\n" + "\n".join(related_chunks)
    # Step 4: Send context and query to Ollama
    prompt = (
        f"{contextual_query}\n\n"
        f"Relevant files and context:\n{context}\n\n"
        f"Answer:"
    )
    print(f"[Prompt length] {len(prompt)} characters, {len(prompt.split())} words")
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )
    resp_json = response.json()
    answer = resp_json.get("response", "No answer returned.").strip()
    print("[Ollama answer]", answer)
    # Extract entities/topics for memory
    entities, topics = extract_entities_and_topics(query + ' ' + answer)
    return answer, results, entities, topics

def is_conversational_query(query):
    conversational_keywords = [
        "hello", "hi", "how are you", "what's up", "who are you", "tell me about yourself",
        "how's the weather", "good morning", "good evening", "thank you", "thanks"
    ]
    q = query.lower()
    return any(kw in q for kw in conversational_keywords)



# Flask API endpoint for RAG workflow
@app.route('/rag_query', methods=['POST'])
def rag_query():
    data = request.get_json()
    query = data.get('query')
    session_id = data.get('session_id', 'default')
    user_info = data.get('user_info')
    if user_info:
        session_context[session_id].update(user_info)
    if not query or not isinstance(query, str):
        return jsonify({'error': 'Query is missing or invalid.'}), 400

    if is_conversational_query(query):
        # Only send the conversation (no chunk retrieval)
        contextual_query = build_contextual_query(query, session_id)
        prompt = f"{contextual_query}\n\nAnswer:"
        print(f"[Prompt length] {len(prompt)} characters, {len(prompt.split())} words")
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )
        resp_json = response.json()
        answer = resp_json.get("response", "No answer returned.").strip()
        print("[Ollama answer]", answer)
        entities, topics = extract_entities_and_topics(query + ' ' + answer)
        conversation_memory[session_id].append((query, answer, entities, topics))
        return jsonify({'response': answer, 'filenames': []})
    else:
        # RAG: retrieve chunks and send with query
        answer, results, entities, topics = query_llm_with_context(query, model, index, chunked_docs, session_id, top_k=1)
        conversation_memory[session_id].append((query, answer, entities, topics))
        filenames = []
        for chunk in results:
            # Find the metadata for this chunk
            for c in processed_chunks:
                if c['text'] == chunk:
                    filenames.append(c['metadata'].get('file_name', 'Unknown'))
                    break
        return jsonify({'response': answer, 'filenames': filenames})



@app.route('/get_file_content', methods=['POST'])
def get_file_content():
    data = request.get_json()
    filename = data.get('filename')
    # Find the file_info for this filename
    file_info = next((f for f in files if f['name'] == filename), None)
    if not file_info:
        return jsonify({'error': 'File not found'}), 404
    text, ext = download_and_extract_text(file_info, GITHUB_TOKEN)
    if text is None:
        return jsonify({'error': 'Could not extract file content'}), 500
    return jsonify({'content': text, 'filename': filename})





if __name__ == '__main__':
    app.run(port=5500, debug=True)