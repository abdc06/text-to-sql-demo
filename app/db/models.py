from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text)
    answer = Column(Text)
    sql_query = Column(Text)
    result_data = Column(JSON)  # 실행 결과 데이터 저장
    created_at = Column(DateTime, default=datetime.utcnow)