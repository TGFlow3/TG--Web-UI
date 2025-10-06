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
import re
import hashlib
import json
import msal
from datetime import datetime
import mimetypes
from pathlib import Path
from collections import defaultdict, deque

# Conversation memory: maps session_id to a deque of (query, answer, entities, topics) tuples
conversation_memory = defaultdict(lambda: deque(maxlen=8))  # Last 8 turns per session
# Session context: maps session_id to user/project/session info
session_context = defaultdict(dict)

app = Flask(__name__)
CORS(app)


# --- SharePoint Integration ---
SHAREPOINT_CLIENT_ID = ""
SHAREPOINT_CLIENT_SECRET = ""
SHAREPOINT_TENANT_ID = ""
SHAREPOINT_SITE_HOSTNAME = ""  # e.g. contoso.sharepoint.com

def get_graph_token():
    authority = f"https://login.microsoftonline.com/{SHAREPOINT_TENANT_ID}"
    app = msal.ConfidentialClientApplication(
        SHAREPOINT_CLIENT_ID,
        authority=authority,
        client_credential=SHAREPOINT_CLIENT_SECRET
    )
    scopes = ["https://graph.microsoft.com/.default"]
    result = app.acquire_token_for_client(scopes=scopes)
    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"Could not obtain access token: {result}")

def list_sharepoint_files(site_hostname, site_path, drive_name):
    token = get_graph_token()
    headers = {"Authorization": f"Bearer {token}"}
    site_url = f"https://graph.microsoft.com/v1.0/sites/{site_hostname}:{site_path}"
    site_resp = requests.get(site_url, headers=headers)
    site_json = site_resp.json()
    site_id = site_json["id"]
    drive_url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives"
    drives = requests.get(drive_url, headers=headers).json()["value"]
    drive_id = next((d["id"] for d in drives if d["name"] == drive_name), None)
    if not drive_id:
        raise Exception(f"Drive '{drive_name}' not found.")
    files_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root/children"
    files_resp = requests.get(files_url, headers=headers)
    files = files_resp.json()["value"]
    return files, headers

def download_and_extract_text(file_obj, headers):
    import io
    fname = file_obj['name']
    ext = fname.split('.')[-1].lower()
    item_id = file_obj['id']
    drive_id = file_obj['parentReference']['driveId']
    file_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/items/{item_id}/content"
    resp = requests.get(file_url, headers=headers)
    if resp.status_code != 200:
        return None, None
    content_bytes = resp.content
    text = None
    try:
        if ext in ['txt', 'md', 'py', 'html']:
            text = content_bytes.decode('utf-8', errors='ignore')
        elif ext == 'pdf':
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content_bytes)) as pdf:
                text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
        elif ext == 'docx':
            from docx import Document
            doc = Document(io.BytesIO(content_bytes))
            text = '\n'.join(p.text for p in doc.paragraphs)
        elif ext in ['png', 'jpg', 'jpeg']:
            from PIL import Image
            import pytesseract
            img = Image.open(io.BytesIO(content_bytes))
            text = pytesseract.image_to_string(img)
    except Exception as e:
        text = None
    return text, ext

# --- Use SharePoint as data source ---
site_path = "/sites/YourSite"  # Update to your SharePoint site path
drive_name = "Documents"  # Update to your SharePoint drive name
print("🔍 Discovering files from SharePoint...")
files, headers = list_sharepoint_files(SHAREPOINT_SITE_HOSTNAME, site_path, drive_name)

files_info = []
for f in files:
    ext = f['name'].split('.')[-1].lower()
    if ext in ['py', 'md', 'txt', 'html', 'pdf', 'docx', 'png', 'jpg', 'jpeg']:
        file_info = {
            'id': f['id'],
            'name': f['name'],
            'extension': '.' + ext,
            'size': f.get('size', 0),
            'modified_time': f.get('lastModifiedDateTime'),
            'path': f"sharepoint://{f['id']}",
            'relative_path': f['name'],
            'directory': '',
            'parentReference': f.get('parentReference', {}),  # ensure parentReference is present
        }
        files_info.append(file_info)


# --------- Advanced Chunking ---------
def intelligent_chunk_text(text, file_info, chunk_size=300, overlap=50):
    """
    Intelligent chunking that respects document structure and content type
    """
    file_path = file_info['path']
    extension = file_info['extension'].lower()
    
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

def chunk_code_file(text, file_info, chunk_size=512):
    """Chunk code files by functions, classes, and logical blocks"""
    file_path = file_info['path']
    extension = file_info['extension'].lower()
    chunks = []
    
    lines = text.split('\n')
    current_chunk = []
    current_size = 0
    current_context = ""
    
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        
        # Skip empty lines and comments for size calculation
        if not line_stripped or line_stripped.startswith('#') or line_stripped.startswith('//'):
            current_chunk.append(line)
            continue
        
        # Detect function/class definitions for context
        if extension == '.py':
            if line_stripped.startswith('def ') or line_stripped.startswith('class '):
                current_context = line_stripped
                # Start new chunk for functions/classes
                if current_chunk:
                    chunk_text = create_chunk_with_metadata(current_chunk, file_info, i-len(current_chunk), current_context)
                    chunks.append(chunk_text)
                current_chunk = [line]
                current_size = len(line)
                continue
        
        current_chunk.append(line)
        current_size += len(line)
        
        # Create chunk when size limit reached
        if current_size > chunk_size and len(current_chunk) > 5:
            chunk_text = create_chunk_with_metadata(current_chunk, file_info, i-len(current_chunk)+1, current_context)
            chunks.append(chunk_text)
            current_chunk = []
            current_size = 0
    
    # Add remaining content
    if current_chunk:
        chunk_text = create_chunk_with_metadata(current_chunk, file_info, len(lines)-len(current_chunk), current_context)
        chunks.append(chunk_text)
    
    return chunks

def chunk_markdown_file(text, file_info, chunk_size=512):
    """Chunk markdown files by headers and sections"""
    chunks = []
    sections = re.split(r'\n(?=#{1,6}\s)', text)
    
    for section in sections:
        if section.strip():
            # If section is too large, split it further
            if len(section) > chunk_size:
                subsections = chunk_text_semantically(section, file_info, chunk_size, 50)
                chunks.extend(subsections)
            else:
                chunk_text = create_chunk_with_metadata([section], file_info, 0, "markdown_section")
                chunks.append(chunk_text)
    
    return chunks

def chunk_text_semantically(text, file_info, chunk_size=512, overlap=50):
    """Semantic chunking for general text files"""
    chunks = []
    
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    current_chunk = []
    current_size = 0
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        # If single paragraph is too large, split by sentences
        if len(paragraph) > chunk_size:
            sentences = re.split(r'[.!?]+', paragraph)
            for sentence in sentences:
                if sentence.strip():
                    current_chunk.append(sentence.strip() + '.')
                    current_size += len(sentence)
                    
                    if current_size > chunk_size:
                        chunk_text = create_chunk_with_metadata(current_chunk, file_info, 0, "text_content")
                        chunks.append(chunk_text)
                        
                        # Keep overlap
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
    
    # Add remaining content
    if current_chunk:
        chunk_text = create_chunk_with_metadata(current_chunk, file_info, 0, "text_content")
        chunks.append(chunk_text)
    
    return chunks

def create_chunk_with_metadata(content_lines, file_info, line_start, context=""):
    """Create a chunk with rich metadata"""
    content = '\n'.join(content_lines) if isinstance(content_lines, list) else content_lines
    
    # Create chunk with metadata
    chunk_data = {
        'content': content,
        'file_path': file_info['path'],
        'file_name': file_info['name'],
        'file_type': file_info['extension'],
        'file_size': file_info['size'],
        'relative_path': file_info['relative_path'],
        'directory': file_info['directory'],
        'line_start': line_start,
        'context': context,
        'chunk_size': len(content),
        'created_at': datetime.now().isoformat()
    }
    
    # Create searchable text with metadata
    searchable_text = f"""File: {file_info['relative_path']}
Type: {file_info['extension']}
Context: {context}
Content: {content}"""
    
    return {
        'text': searchable_text,
        'metadata': chunk_data
    }

print("\n📄 Processing documents...")
processed_chunks = []
processing_stats = {
    'successful': 0,
    'failed': 0,
    'total_chunks': 0,
    'by_type': {}
}

for i, file_info in enumerate(files_info):
    print(f"Processing {i+1}/{len(files_info)}: {file_info['name']}", end="")
    
    # Extract text from SharePoint file
    text, ext = download_and_extract_text(file_info, headers)
    status = 'Success' if text else 'Failed to extract text'
    
    if text is None:
        print(f" ❌ Failed: {status}")
        processing_stats['failed'] += 1
        continue
    
    # Chunk the text intelligently
    try:
        chunks = intelligent_chunk_text(text, file_info)
        processed_chunks.extend(chunks)
        
        # Update statistics
        processing_stats['successful'] += 1
        processing_stats['total_chunks'] += len(chunks)
        
        file_type = file_info['extension']
        if file_type not in processing_stats['by_type']:
            processing_stats['by_type'][file_type] = {'files': 0, 'chunks': 0}
        processing_stats['by_type'][file_type]['files'] += 1
        processing_stats['by_type'][file_type]['chunks'] += len(chunks)
        
        print(f" ✅ Success: {len(chunks)} chunks")
        
    except Exception as e:
        print(f" ❌ Chunking failed: {str(e)}")
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


def extract_entities_and_topics(text):
    # Simple entity/topic extraction: capitalized words and keywords
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


# Example usage:
#answer = query_llm_with_context("What about getting to know elon musk?", model, index, chunked_docs, top_k=5)
#print("LLM Answer:", answer)

def is_conversational_query(query):
    conversational_keywords = [
        "hello", "hi", "how are you", "what's up", "who are you", "tell me about yourself",
        "how's the weather", "good morning", "good evening", "thank you", "thanks"
    ]
    q = query.lower()
    return any(kw in q for kw in conversational_keywords)





# Endpoints


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
        answer, results, entities, topics = query_llm_with_context(query, model, index, chunked_docs, session_id, top_k=5)
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
    file_info = next((f for f in files_info if f['name'] == filename), None)
    if not file_info:
        return jsonify({'error': 'File not found'}), 404
    text, ext = download_and_extract_text(file_info, headers)
    if text is None:
        return jsonify({'error': 'Could not extract file content'}), 500
    return jsonify({'content': text, 'filename': filename})





if __name__ == '__main__':
    # Run with HTTPS to avoid mixed content issues
    app.run(debug=True, ssl_context='adhoc', port=5000)

