from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import ChatHistory
from core.engine import analyzer

router = APIRouter()

@router.post("/ask")
async def ask_question(question: str, db: Session = Depends(get_db)):
    try:
        # 1. SQL 생성
        sql, tables = await analyzer.generate_sql(question)
        
        # 2. SQL 실행
        data = analyzer.execute_sql(sql)
        
        # 3. 자연어 답변 생성
        ans_prompt = f"Question: {question}\nData: {data}\nExplain in Korean."
        answer = await analyzer.llm.ainvoke(ans_prompt)
        
        # 4. DB에 이력 저장
        history = ChatHistory(
            question=question,
            answer=answer.content,
            sql_query=sql,
            result_data=data
        )
        db.add(history)
        db.commit()
        db.refresh(history)

        return {
            "id": history.id,
            "answer": history.answer,
            "sql": sql,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))