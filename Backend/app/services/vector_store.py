import os
from typing import List
from app.core.config import settings
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

class VectorStoreManager:
    def __init__(self):
        self.cohere_key = settings.COHERE_API_KEY or os.getenv("COHERE_API_KEY")
        if self.cohere_key:
            self.embeddings = CohereEmbeddings(
                cohere_api_key=self.cohere_key,
                model="embed-english-v3.0"
            )
        else:
            self.embeddings = None

    def create_and_index_documents(self, documents: List[Document], session_id: str):
        """Indexes scraped document snippets into Vector DB (FAISS for Dev, Pinecone for Prod)."""
        if not documents:
            return None

        if not self.embeddings:
            print("[VECTOR STORE] Cohere API Key missing, skipping embedding indexing.")
            return None

        if settings.ENV_MODE == "production" and settings.PINECONE_API_KEY:
            try:
                from pinecone import Pinecone, ServerlessSpec
                pc = Pinecone(api_key=settings.PINECONE_API_KEY)
                
                index_name = settings.PINECONE_INDEX_NAME
                existing_indexes = [i.name for i in pc.list_indexes()]
                if index_name not in existing_indexes:
                    pc.create_index(
                        name=index_name,
                        dimension=1024, # Cohere embed-english-v3.0 dimension
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1")
                    )
                
                from langchain_pinecone import PineconeVectorStore
                vectorstore = PineconeVectorStore.from_documents(
                    documents=documents,
                    embedding=self.embeddings,
                    index_name=index_name,
                    namespace=session_id
                )
                print(f"[VECTOR STORE PROD] Successfully indexed documents to Pinecone (index: {index_name}, namespace: {session_id})")
                return vectorstore
            except Exception as e:
                print(f"[VECTOR STORE PROD WARNING] Pinecone indexing failed: {e}. Falling back to FAISS.")

        # Default Development / Fallback Mode using FAISS
        try:
            vectorstore = FAISS.from_documents(documents=documents, embedding=self.embeddings)
            print("[VECTOR STORE DEV] Successfully indexed documents to FAISS local vector DB.")
            return vectorstore
        except Exception as e:
            print(f"[VECTOR STORE FAISS ERROR] {e}")
            return None

    def similarity_search(self, vectorstore, query: str, k: int = 3) -> str:
        """Retrieves context snippets from vectorstore."""
        if not vectorstore:
            return ""
        try:
            docs = vectorstore.similarity_search(query, k=k)
            return "\n\n".join([d.page_content for d in docs])
        except Exception as e:
            print(f"[VECTOR STORE SEARCH ERROR] {e}")
            return ""

vector_manager = VectorStoreManager()
