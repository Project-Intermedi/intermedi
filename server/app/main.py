from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api import medicine, pill, records, safety
from app.core.config import BASE_DIR
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


# 전시용 — 프론트 빌드본을 같은 서버에서 서빙한다.
# 개발 중에는 Vite 프록시가 /api 를 떼고 보내지만, 빌드본은 같은 출처로
# /api 를 그대로 호출하므로 라우터를 /api 접두사로 한 번 더 등록한다.
for _r in (pill.router, records.router, safety.router, medicine.router):
    app.include_router(_r, prefix='/api')

DIST = BASE_DIR.parent / 'app' / 'dist'

if DIST.is_dir():
    app.mount('/assets', StaticFiles(directory=DIST / 'assets'), name='assets')

    @app.get('/{full_path:path}', include_in_schema=False)
    def spa_fallback(full_path: str):
        if full_path.startswith(('api/', 'docs', 'openapi.json')):
            raise HTTPException(404)
        f = (DIST / full_path).resolve()
        if full_path and f.is_file() and DIST.resolve() in f.parents:
            return FileResponse(f)
        return FileResponse(DIST / 'index.html')
