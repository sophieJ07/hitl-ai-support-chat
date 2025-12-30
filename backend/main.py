from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import get_current_user
from dotenv import load_dotenv
import os 

load_dotenv()

app = FastAPI()
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# configure CORS for react 
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    content: str

@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.get("/health")
def health():
    return {"status": "ok"}

# protected route example
@app.get("/api/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    return {
        "message": "this is a protected route",
        "all_claims": current_user
    }

# chat endpoint (protected)
@app.post("/api/chat")
def chat(
    message: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    user_message = message.content
    
    # ai logic placeholder
    ai_response = f"Echo: {user_message}"
    
    return {
        "role": "ai",
        "content": ai_response,
        "user_id": current_user.get("sub")
    }
