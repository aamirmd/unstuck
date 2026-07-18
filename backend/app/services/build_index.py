"""One-off script to (re)build the persistent Chroma vector DB from data/*.md.

Run with: python -m app.services.build_index
"""
from pathlib import Path

# from app.config import settings

DATA_DIR = Path("data")
CHROMA_DB_PATH = str(DATA_DIR / "chroma_db")
COLLECTION_NAME = "productivity_techniques"


def chunk_markdown(text: str) -> list[str]:
    from langchain_text_splitters import Language, RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter.from_language(
        language=Language.MARKDOWN, chunk_size=500, chunk_overlap=50
    )
    return splitter.split_text(text)


def build_index() -> None:
    import chromadb
    from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

    md_files = sorted(DATA_DIR.glob("*.md"))
    if not md_files:
        print(f"No .md files found in {DATA_DIR}")
        return

    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

    existing = {c.name for c in client.list_collections()}
    if COLLECTION_NAME in existing:
        client.delete_collection(COLLECTION_NAME)

    embedding_function = SentenceTransformerEmbeddingFunction()
    collection = client.create_collection(
        name=COLLECTION_NAME, embedding_function=embedding_function
    )

    ids: list[str] = []
    documents: list[str] = []
    metadatas: list[dict] = []

    for md_file in md_files:
        text = md_file.read_text(encoding="utf-8")
        for i, chunk in enumerate(chunk_markdown(text)):
            ids.append(f"{md_file.stem}-{i}")
            documents.append(chunk)
            metadatas.append({"source": md_file.name, "chunk_index": i})

    collection.add(ids=ids, documents=documents, metadatas=metadatas)

    print(f"Indexed {len(documents)} chunks from {len(md_files)} files into '{COLLECTION_NAME}'")
    print(f"Persisted at: {CHROMA_DB_PATH}")


if __name__ == "__main__":
    build_index()
