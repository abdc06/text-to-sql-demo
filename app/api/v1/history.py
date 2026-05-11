from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import ChatHistory

router = APIRouter()

@router.get("/")
def get_all_history(db: Session = Depends(get_db)):
    # 최신순으로 20개 조회
    return db.query(ChatHistory).order_by(ChatHistory.created_at.desc()).limit(20).all()

@router.get("/{history_id}")
def get_detail(history_id: int, db: Session = Depends(get_db)):
    return db.query(ChatHistory).filter(ChatHistory.id == history_id).first()