from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import medicine, pill, records, safety
from app.models import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init()
    yield


app = FastAPI(title='인터메디 API', version='0.1', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(pill.router)
app.include_router(records.router)
app.include_router(safety.router)
app.include_router(medicine.router)


@app.get('/health')
def health():
    return {'ok': True}