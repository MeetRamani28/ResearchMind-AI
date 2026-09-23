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
        self._index_verified = False

    def create_and_index_documents(self, documents: List[Document], session_id: str):
        """Indexes scraped document snippets into Vector DB (Fast FAISS/Pinecone without repeated index creation delays)."""
        if not documents or not self.embeddings:
            return None

        if settings.ENV_MODE == "production" and settings.PINECONE_API_KEY:
            try:
                os.environ["PINECONE_API_KEY"] = settings.PINECONE_API_KEY
                from pinecone import Pinecone, ServerlessSpec
                pc = Pinecone(api_key=settings.PINECONE_API_KEY)
                index_name = settings.PINECONE_INDEX_NAME

                if not self._index_verified:
                    existing = [i.name for i in pc.list_indexes()]
                    if index_name not in existing:
                        pc.create_index(
                            name=index_name,
                            dimension=1024,
                            metric="cosine",
                            spec=ServerlessSpec(cloud="aws", region="us-east-1")
                        )
                    self._index_verified = True
                
                from langchain_pinecone import PineconeVectorStore
                vectorstore = PineconeVectorStore.from_documents(
                    documents=documents,
                    embedding=self.embeddings,
                    index_name=index_name,
                    namespace=session_id,
                    pinecone_api_key=settings.PINECONE_API_KEY
                )
                return vectorstore
            except Exception as e:
                print(f"[VECTOR STORE PROD WARNING] Pinecone fast indexing fallback: {e}")

        # Development or Fast Fallback Mode using In-Memory FAISS
        try:
            vectorstore = FAISS.from_documents(documents=documents, embedding=self.embeddings)
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
