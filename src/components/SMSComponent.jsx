import React, { useState, useEffect } from "react";

const SERVER_URL = "http://192.168.1.10:5000";
const auth_number = "+639171526388";

function SMSComponent() {
  const [activeTab, setActiveTab] = useState("send"); // Toggle between send/inbox
  const [to, setTo] = useState("+639171526388");
  const [text, setText] = useState("");
  const [inboxMessages, setInboxMessages] = useState([]);

  useEffect(() => {
    if (activeTab === "inbox") {
      fetchInboxMessages();
    }
  }, [activeTab]);

  const fetchInboxMessages = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/sms/inbox`);
      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      console.log("📥 SMS Inbox API Response:", data.results); // Debug log

      setInboxMessages(data.results);
    } catch (error) {
      console.error("Failed to fetch SMS inbox:", error);
      setInboxMessages([]); // Ensure state is always an array
    }
  };

  const fetchSMSLogs = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/sms/logs`);
      const data = await response.json();

      console.log("SMS Logs:", data);
      alert("Check the console for logs!");
    } catch (error) {
      console.error("Failed to fetch SMS logs:", error.message);
    }
  };

  const sendSMS = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, text }),
      });

      const data = await response.json();
      if (data.success) {
        alert("SMS sent successfully!");
      } else {
        alert("Failed to send SMS: " + data.error);
      }
    } catch (error) {
      console.error("Twilio SMS Error:", error);
      alert("Failed to send SMS");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="w-80 bg-white shadow-xl rounded-2xl p-5">
        {/* Navigation Tabs */}
        <nav className="flex justify-between mb-4">
          <button
            className={`w-1/2 p-2 ${
              activeTab === "send" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setActiveTab("send")}
          >
            Send SMS
          </button>
          <button
            className={`w-1/2 p-2 ${
              activeTab === "inbox" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setActiveTab("inbox")}
          >
            Inbox
          </button>
        </nav>

        <button
          className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
          onClick={fetchSMSLogs}
        >
          Fetch SMS Logs (For Debugging Purposes)
        </button>

        {/* Send SMS Section */}
        {activeTab === "send" && (
          <>
            <div className="bg-gray-200 rounded-lg p-4 text-center mb-4">
              <h2 className="text-lg font-bold text-gray-700">Send SMS</h2>
              <input
                type="text"
                className="w-full text-center bg-transparent text-xl font-mono outline-none"
                value={auth_number}
                onChange={(e) => setTo(e.target.value)}
                placeholder={auth_number}
              />
            </div>
            <textarea
              className="w-full p-3 border rounded-lg mb-3 text-sm"
              rows="3"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            <button
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
              onClick={sendSMS}
            >
              Send SMS
            </button>
          </>
        )}

        {/* Inbox Section */}
        {activeTab === "inbox" && (
          <div>
            <h2 className="text-lg font-bold mb-3">Inbox</h2>
            {inboxMessages.length === 0 ? (
              <p className="text-gray-500">No messages found</p>
            ) : (
              <ul className="space-y-3">
                {inboxMessages.map((msg, index) => (
                  <li key={index} className="p-3 border rounded-lg">
                    <strong>From:</strong> {msg.from} <br />
                    <strong>To:</strong> {msg.to} <br />
                    <p className="mt-1">{msg.text}</p>
                    <small className="text-gray-500">
                      Sent: {new Date(msg.dateSent).toLocaleString()}
                    </small>
                    <br></br>
                    <br></br>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SMSComponent;
