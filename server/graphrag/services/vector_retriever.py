from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from django.conf import settings

# =========================
# CONFIG
# =========================
CHROMA_DIR = getattr(settings, "CHROMA_PERSIST_DIR", "chroma_db")

# =========================
# EMBEDDING MODEL
# =========================
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# =========================
# VECTOR STORE INIT
# =========================
def get_vector_store():
    return Chroma(persist_directory=CHROMA_DIR, embedding_function=embedding_model)


# =========================
# ADD DOCUMENTS
# =========================
def add_documents(text_list, user_id=None):
    if not text_list:
        return {"added": 0}

    try:
        vectordb = get_vector_store()

        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

        docs = []
        metadatas = []

        for text in text_list:
            if not text:
                continue

            chunks = splitter.split_text(text)

            for chunk in chunks:
                docs.append(chunk)

                # 🔥 ADD USER METADATA
                if user_id:
                    metadatas.append({"user_id": user_id})
                else:
                    metadatas.append({})

        if not docs:
            return {"added": 0}

        vectordb.add_texts(docs, metadatas=metadatas)

        return {"added": len(docs)}

    except Exception as e:
        print("Chroma add error:", e)
        return {"added": 0}


# =========================
# SEARCH
# =========================
def search(query, top_k=3, user_id=None):
    if not query:
        return []

    try:
        vectordb = get_vector_store()

        # 🔥 APPLY USER FILTER
        if user_id:
            results = vectordb.similarity_search_with_score(
                query, k=top_k * 3, filter={"user_id": user_id}
            )
        else:
            results = vectordb.similarity_search_with_score(query, k=top_k * 3)

        print("🔍 Raw search results:", results)

        seen = set()
        filtered = []

        for doc, score in results:
            text = doc.page_content.strip()

            if text not in seen:
                seen.add(text)
                filtered.append((text, float(score)))

            if len(filtered) >= top_k:
                break

        return filtered

    except Exception as e:
        print("Chroma search error:", e)
        return []
