from sqlalchemy import create_engine, text
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_community.utilities import SQLDatabase
from langchain_chroma import Chroma
from langchain_core.documents import Document
from core.config import settings

class SQLAnalyzer:
    def __init__(self):
        self.engine = create_engine(settings.BIZ_DB_URL)
        self.db = SQLDatabase.from_uri(settings.BIZ_DB_URL)
        self.llm = ChatOllama(model=settings.LLM_MODEL, temperature=0)
        self.embeddings = OllamaEmbeddings(model=settings.EMBED_MODEL)
        self.vectorstore = self._build_index()

    def _build_index(self):
        query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        with self.engine.connect() as conn:
            tables = conn.execute(text(query)).fetchall()
            docs = [Document(page_content=f"Table: {t[0]}", metadata={"name": t[0]}) for t in tables]
        return Chroma.from_documents(docs, self.embeddings)

    async def generate_sql(self, question: str):
        relevant_docs = self.vectorstore.similarity_search(question, k=3)
        table_names = [d.metadata["name"] for d in relevant_docs]
        table_info = self.db.get_table_info(table_names=table_names)

        prompt = f"Write a PostgreSQL query for: {question}\n\nSchema:\n{table_info}\n\nReturn ONLY SQL."
        response = await self.llm.ainvoke(prompt)
        sql = response.content.strip().replace("```sql", "").replace("```", "").split(';')[0] + ';'
        return sql, table_names

    def execute_sql(self, sql: str):
        with self.engine.connect() as conn:
            result = conn.execute(text(sql))
            return [dict(row._mapping) for row in result]

analyzer = SQLAnalyzer() # 싱글톤 객체 생성