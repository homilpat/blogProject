from fastapi import FastAPI
from app.api.endpoints import router as rag_router
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description='제조지식창고 RAG 및 기술 블로그 통합 AI 서빙 엔진',
    version='1.0.0'
)

app.include_router(rag_router)

@app.get('/')
def root():
    return {'message': 'Manufacturing Knowledge RAG Engine is running.'}
