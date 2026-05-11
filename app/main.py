from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1 import chat, history
from db.session import init_db

app = FastAPI(title="AI SQL Assistant")

# CORS 설정 (React 연동을 위해 필수)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서버 시작 시 DB 테이블 생성
@app.on_event("startup")
def on_startup():
    init_db()

# 라우터 등록
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(history.router, prefix="/api/v1/history", tags=["History"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)