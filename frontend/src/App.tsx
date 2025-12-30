import { useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";
import {config} from './config.ts';

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

function App() {
  //cognito auth
  const auth = useAuth(); 

  //handles chat messages
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

    try{
      const token = auth.user?.id_token;
      
      const response = await fetch(config.api.baseUrl + "/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: input }),
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        role: "ai",
        content: data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // placeholder ai response 
    const aiMessage: ChatMessage = {
      role: "ai",
      content: "This is a placeholder AI response.",
    };

    setMessages((prev) => [...prev, aiMessage]);

  };


  //end session and sign out 
  const signOutRedirect = async () => {
    const clientId = config.aws.clientId;
    const logoutUri = window.location.origin;
    const cognitoDomain = config.aws.domain;
    
    // clear local tokens 
    await auth.removeUser();
    
    // redirect to cognito logout -> clears server session
    const logoutUrl = `${config.aws.domain}/logout?client_id=${config.aws.clientId}&logout_uri=${encodeURIComponent(window.location.origin)}`;
    window.location.href = logoutUrl;
  };

  //auth logic 
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="auth-container">
        <h2>Supportive AI Chat</h2>
        <p>Please sign in to start chatting.</p>
        <button onClick={() => auth.signinRedirect()}>Sign In</button>
      </div>
    );
  }


  return (
    <div className="app-container">
      <div className="header">
        <span className="header-title">Supportive AI Chat</span>
        <button className="signout-btn" onClick={signOutRedirect}> Sign Out </button>

        {/* // temp backend test button */}
        <button 
          className="test-btn" 
          onClick={async () => {
            try {
              const token = auth.user?.id_token;
              console.log('Token:', token?.substring(0, 30) + '...');
      
              const response = await fetch("http://localhost:8000/api/protected", {
                  headers: { "Authorization": `Bearer ${token}` }
              });
      
              const data = await response.json();
              console.log('Response:', data);
              alert('SUCCESS! Check console for details');
          } catch (error) {
            console.error('Error:', error);
            alert('FAILED! Check console');
          }
      }}>
          Test Backend
      </button>


      </div>

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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
