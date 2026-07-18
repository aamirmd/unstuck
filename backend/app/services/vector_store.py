"""Read-only queries against the persistent Chroma vector DB built by build_index.py."""
from app.services.build_index import CHROMA_DB_PATH, COLLECTION_NAME

_collection = None


def _get_collection():
    global _collection
    if _collection is not None:
        return _collection

    try:
        import chromadb
        from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

        client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        _collection = client.get_collection(
            name=COLLECTION_NAME, embedding_function=SentenceTransformerEmbeddingFunction()
        )
    except Exception as e:
        print(f"Vector store unavailable (has build_index.py been run?): {e}")
        _collection = None

    return _collection


def query_techniques(query_text: str, n_results: int = 3) -> str:
    collection = _get_collection()
    if collection is None:
        return ""

    results = collection.query(query_texts=[query_text], n_results=n_results)
    documents = results.get("documents", [[]])[0]
    return "\n\n".join(documents)
