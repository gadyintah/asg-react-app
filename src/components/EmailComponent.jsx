import React, { useState, useEffect } from "react";

const SERVER_URL = "http://192.168.1.10:5000";

function EmailComponent() {
  const [activeTab, setActiveTab] = useState("send"); // "send" or "inbox"
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [inboxEmails, setInboxEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "inbox") {
      fetchInboxEmails();
    }
  }, [activeTab]);

  const fetchInboxEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/email/inbox`);
      const textResponse = await response.text();
      console.log("🖥 Raw API Response:", textResponse);
  
      const data = JSON.parse(textResponse);
      console.log("📩 Parsed Data:", data);
  
      if (!data.emails) throw new Error("Invalid response format");
  
      const filteredEmails = data.emails.filter(
        (email) => email.from && !email.from.includes("jikiorejo@yahoo.com.ph")
      );
  
      setInboxEmails(filteredEmails);
    } catch (error) {
      console.error("⚠️ Failed to fetch inbox emails:", error);
      setInboxEmails([]);
    } finally {
      setLoading(false);
    }
  };
  

  const sendEmail = async () => {
    const formData = new FormData();
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("text", text);
    
    attachments.forEach((file) => {
      formData.append("attachment", file);
    });

    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/api/email/send`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(data.success ? "Email sent successfully!" : "Failed to send email");

      if (data.success) {
        setAttachments([]);
        setText("");
        setSubject("");
        setTo("");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setAttachments([...event.target.files]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <nav style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("send")} style={{ marginRight: "10px" }}>
          Send Email
        </button>
        <button onClick={() => setActiveTab("inbox")}>Inbox</button>
      </nav>

      {activeTab === "send" && (
        <div>
          <h2>Send Email</h2>
          <input
            type="email"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          <textarea
            placeholder="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          <input type="file" multiple onChange={handleFileChange} style={{ marginBottom: "10px" }} />
          <button onClick={sendEmail} disabled={loading}>
            {loading ? "Sending..." : "Send Email"}
          </button>
        </div>
      )}

      {activeTab === "inbox" && (
        <div>
          <h2>Inbox</h2>
          {loading ? (
            <p>Loading...</p>
          ) : inboxEmails.length === 0 ? (
            <p>No emails found</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {inboxEmails.map((email, index) => (
                <li key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                  <strong>From:</strong> {email.from} <br />
                  <strong>To:</strong> {email.to} <br />
                  <strong>Subject:</strong> {email.subject} <br />
                  <div dangerouslySetInnerHTML={{ __html: email.text }} />
                  {email.attachments && email.attachments.length > 0 && (
                    <div>
                      <strong>Attachments:</strong>
                      <ul>
                        {email.attachments.map((attachment, attIndex) => (
                          <li key={attIndex}>
                            <a
                              href={`data:${attachment.contentType};base64,${attachment.content}`}
                              download={attachment.filename}
                            >
                              📎 {attachment.filename}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default EmailComponent;
