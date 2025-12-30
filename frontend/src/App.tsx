import { useState } from "react";
import "./App.css";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // placeholder ai response 
    const aiMessage: ChatMessage = {
      role: "ai",
      content: "This is a placeholder AI response.",
    };

    setMessages((prev) => [...prev, aiMessage]);
  };

  return (
    <div className="app-container">
      <div className="header">Supportive AI Chat</div>

      <div className="chat-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
