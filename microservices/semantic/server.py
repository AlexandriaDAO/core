import requests
from contextlib import asynccontextmanager
from io import BytesIO
from PIL import Image
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

ARWEAVE_GATEWAY = "https://arweave.net"
ARWEAVE_ID_PATTERN = r"^[A-Za-z0-9_-]{43}$"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    print("Loading CLIP model...")
    model = SentenceTransformer("clip-ViT-B-32")
    print("Model loaded.")
    yield


app = FastAPI(title="NFT Embedding Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmbedTextRequest(BaseModel):
    query: str


class EmbedArweaveRequest(BaseModel):
    arweave_id: str = Field(pattern=ARWEAVE_ID_PATTERN)


def _decode_image(data: bytes) -> Image.Image:
    try:
        return Image.open(BytesIO(data)).convert("RGB")
    except Exception:
        raise HTTPException(400, "content is not a valid image")


@app.post("/embed/text")
def embed_text(req: EmbedTextRequest):
    """Embed a text query into CLIP vector space."""
    embedding = model.encode(req.query)
    return {"embedding": embedding.tolist()}


@app.post("/embed/image")
async def embed_image(file: UploadFile = File(...)):
    """Embed a user-uploaded image. PIL decode is the real image check —
    the client-supplied content-type header is not trusted."""
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"image exceeds {MAX_UPLOAD_BYTES} bytes")

    img = _decode_image(data)
    embedding = model.encode(img)
    return {"embedding": embedding.tolist()}


@app.post("/embed/arweave")
def embed_arweave(req: EmbedArweaveRequest):
    """Verify an Arweave transaction is an image, then CLIP-encode it.
    Two checks because the gateway is untrusted: HEAD content-type filters
    cheaply, then PIL decode rejects bytes that don't actually parse."""
    url = f"{ARWEAVE_GATEWAY}/{req.arweave_id}"

    try:
        head = requests.head(url, timeout=10, allow_redirects=True)
        head.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(502, f"Arweave gateway unreachable: {e}")

    content_type = head.headers.get("content-type", "")
    if not content_type.startswith("image/"):
        raise HTTPException(
            400,
            f"{req.arweave_id} is not an image (content-type: {content_type or 'unknown'})",
        )

    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(502, f"Failed to download image: {e}")

    img = _decode_image(resp.content)
    embedding = model.encode(img)
    return {
        "arweave_id": req.arweave_id,
        "embedding": embedding.tolist(),
    }
