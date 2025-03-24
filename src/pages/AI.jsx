import { useState } from "react";
import axios from "axios";

function AI() {
  const [message, setMessage] = useState(""); // User input message
  const [chatHistory, setChatHistory] = useState([]); // Chat history
  const [loading, setLoading] = useState(false); // Request loading state

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter a message!");
      return;
    }

    const userMessage = { sender: "user", text: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      if (message.toLowerCase().includes("music") || message.toLowerCase().includes("rest")) {
        const searchResult = await mockSearchMusic();
        const aiMessage = { sender: "ai", text: searchResult };
        setChatHistory((prev) => [...prev, aiMessage]);
      } else {
        const response = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBgLyImS_akhGoVaGYxioyv4DtydApFKnk",
          {
            contents: [
              {
                parts: [{ text: message }],
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const aiReply = response.data.candidates[0].content.parts[0].text;
        const aiMessage = { sender: "ai", text: aiReply };
        setChatHistory((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("AI request failed:", error);
      const errorMessage = { sender: "ai", text: "Sorry, something went wrong. Please try again later." };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const mockSearchMusic = async () => {
    return "Here’s a relaxing music link: [https://www.youtube.com/watch?v=5qap5z_G4QY](https://www.youtube.com/watch?v=5qap5z_G4QY). Give it a listen and relax!";
  };

  // Handle keyboard events in the textarea
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Submit form when Enter is pressed alone
      e.preventDefault();
      sendMessage(e);
    }
    // Shift + Enter allows line break without submitting
  };

  return (
    <div className="chat-container">
      <h2 className="center-text">AI Chat Assistant</h2>
      <div className="chat-box">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`message ${chat.sender === "user" ? "user-message" : "ai-message"}`}
          >
            {chat.text}
          </div>
        ))}
        {loading && <div className="message ai-message">AI is thinking...</div>}
      </div>
      <form onSubmit={sendMessage} className="input-area">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder=""
          disabled={loading}
          rows="4" // Default display of 4 rows
        />
        <input type="submit" value="Send" disabled={loading} />
      </form>

      <style jsx>{`
        .chat-container {
          background-color: #ffffff;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          max-width: 700px;
          margin: 30px auto;
          width: 100%;
          box-sizing: border-box;
        }

        .center-text {
          text-align: center;
          color: #2c3e50;
          font-size: 28px;
          margin-bottom: 25px;
          font-weight: 500;
        }

        .chat-box {
          height: 500px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 25px;
          background-color: #fafafa;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .message {
          margin: 12px 0;
          padding: 12px 15px;
          border-radius: 8px;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          font-size: 16px;
        }

        .user-message {
          background-color: #d1e7ff;
          text-align: right;
          margin-left: 20%;
        }

        .ai-message {
          background-color: #ececec;
          text-align: left;
          margin-right: 20%;
        }

        .input-area {
          display: flex;
          gap: 15px;
          width: 100%;
          flex-wrap: nowrap;
          align-items: flex-start; /* Top-align button with textarea */
        }

        textarea {
          flex: 1;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 18px;
          min-width: 0;
          background-color: #fff;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: border-color 0.3s ease;
          resize: vertical; /* Allow vertical resizing */
          min-height: 100px; /* Minimum height to ensure sufficient size */
          line-height: 1.5; /* Comfortable line spacing */
        }

        textarea:focus {
          border-color: #4caf50;
          outline: none;
        }

        input[type="submit"] {
          padding: 14px 25px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          flex-shrink: 0;
          transition: background-color 0.3s ease;
        }

        input[type="submit"]:hover {
          background-color: #45a049;
        }

        input[type="submit"]:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .chat-container {
            padding: 15px;
            margin: 15px;
            max-width: 100%;
          }

          .chat-box {
            height: 400px;
          }

          .center-text {
            font-size: 24px;
          }

          .input-area {
            gap: 10px;
          }

          textarea {
            font-size: 16px;
            padding: 12px;
            min-height: 80px; /* Slightly smaller on small screens */
          }

          input[type="submit"] {
            padding: 12px 20px;
            font-size: 14px;
          }

          .message {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default AI;