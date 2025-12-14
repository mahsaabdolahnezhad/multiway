from fastapi import FastAPI, Request
import httpx
import uvicorn
from typing import Dict, Any

app = FastAPI()
db: Dict[str, Any] = {}

JAVA_URL = "http://localhost:8081/chain"   # where Python forwards to Java
SERVICE_PORT = 8001

@app.get("/")
def home():
    return {"service": "python-service", "status": "running"}

@app.post("/save")
async def save(data: Dict):
    db["data"] = data
    return {"status": "saved"}

@app.get("/load")
async def load():
    return db.get("data", {"empty": True})

@app.get("/health")
def health():
    return {"service": "python-service", "status": "healthy"}

@app.get("/test_java")
async def test_java():
    """Test Python → Java simple connectivity."""
    test_url = "http://localhost:8081/"
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            r = await client.get(test_url)
            r.raise_for_status()
            return {"status": "ok", "java_response": r.json()}
        except Exception as e:
            return {"status": "error", "detail": str(e)}


@app.post("/start_chain")
async def start_chain(payload: Dict):
    """
    Start the chain: Python -> Java -> Rust -> Python (callback)
    We POST to Java with a `callback` pointing back to /chain_callback on this service.
    """
    callback_url = f"http://localhost:{SERVICE_PORT}/chain_callback"
    body = {
        "payload": payload,
        "callback": callback_url
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            r = await client.post(JAVA_URL, json=body)
            r.raise_for_status()
            return {"status": "sent_to_java", "java_response": r.json()}
        except Exception as e:
            return {"status": "failed", "detail": str(e)}

@app.post("/chain_callback")
async def chain_callback(data: Dict):
    """
    Final receiver of the chain. Rust will POST the final result here.
    We store it in `db` and reply.
    """
    db["chain_result"] = data
    print("🔔 Chain callback received:", data)
    return {"status": "received", "stored": True}

@app.get("/test_chain")
async def test_chain():
    """
    Test endpoint that starts the full chain with a sample payload.
    Python → Java → Rust → Python callback
    """
    payload = {"message": "Hello, this is a test chain!"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Start the chain by posting to /start_chain
            r = await client.post(f"http://localhost:{SERVICE_PORT}/start_chain", json=payload)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"status": "failed", "detail": str(e)}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=SERVICE_PORT, reload=True)

