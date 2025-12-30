from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatMessage(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
def chat(msg: ChatMessage):
    # placeholder response 
    return {"response": f"AI echoes: {msg.text}"}
