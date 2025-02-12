// client/src/components/ChatComponent.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const SERVER_URL = "http://192.168.1.10:5000";
const socket = io(SERVER_URL);

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [attachment, setAttachment] = useState(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Check if the user already has a saved username
    let storedUsername = localStorage.getItem("chatUsername");
    if (!storedUsername) {
      storedUsername = `User${Math.floor(Math.random() * 10000)}`; // Generate random username
      localStorage.setItem("chatUsername", storedUsername);
    }
    setUsername(storedUsername);

    // Fetch chat history from the server
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/chat/history`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchChatHistory();

    // Socket.IO event listener for new messages
    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.off("chat message");
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({ name: file.name, data: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() || attachment) {
      const message = {
        sender: username,
        content: newMessage,
        attachment: attachment
          ? { name: attachment.name, data: attachment.data }
          : null,
        timestamp: new Date(),
      };

      // Emit message via Socket.IO
      socket.emit("chat message", message);

      // Save message to database
      fetch(`${SERVER_URL}/api/chat/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      setNewMessage("");
      setAttachment(null);
    }
  };

  return (
    <div>
      <h2>Chat - {username}</h2>
      <div
        className="chat-box"
        ref={chatBoxRef}
        style={{
          overflowY: "scroll",
          height: "300px",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{msg.sender}:</strong> {msg.content}
            {msg.attachment && (
              <div>
                <a href={msg.attachment.data} download={msg.attachment.name}>
                  📎 {msg.attachment.name}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Your message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />
      <input type="file" onChange={handleFileChange} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatComponent;
