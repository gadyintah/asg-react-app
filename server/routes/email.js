const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fetch = require("node-fetch");
require("dotenv").config();
const Imap = require("imap-simple");
const { simpleParser } = require("mailparser");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// // Store tokens and expiry time in memory
// let yahooTokens = {
//   accessToken: null,
//   refreshToken: process.env.REFRESH_TOKEN, // Start with .env refresh token
//   expiresAt: 0, // Timestamp when the token expires
// };

// // Function to get or refresh Yahoo OAuth2 token
// async function getYahooAccessToken() {
//   const now = Date.now();
//   if (yahooTokens.accessToken && now < yahooTokens.expiresAt) {
//     return yahooTokens.accessToken;
//   }

//   console.log("🔄 Refreshing Yahoo access token...");
//   const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       client_id: process.env.CLIENT_ID,
//       client_secret: process.env.CLIENT_SECRET,
//       redirect_uri: "oob",
//       refresh_token: yahooTokens.refreshToken,
//       grant_type: "refresh_token",
//     }),
//   });

//   const data = await response.json();
//   if (!data.access_token) throw new Error("Failed to retrieve access token");

//   yahooTokens.accessToken = data.access_token;
//   yahooTokens.refreshToken = data.refresh_token || yahooTokens.refreshToken;
//   yahooTokens.expiresAt = now + data.expires_in * 1000;
//   return yahooTokens.accessToken;
// }

// Send an email via Yahoo SMTP
router.post("/send", upload.array("attachment", 5), async (req, res) => {
  try {
    console.log("Received File:", req.files);
    console.log("Received Body:", req.body);
    const { to, subject, text } = req.body;
    let attachments = [];

    // Process file if present
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        filename: file.originalname,
        content: file.buffer, // Ensure this is passed correctly
        contentType: file.mimetype,
      }));
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: text,
      attachments: attachments.length > 0 ? attachments : [],
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const imapConfig = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.mail.yahoo.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
  },
};

const fetchEmails = async () => {
  try {
    const connection = await Imap.connect(imapConfig);
    await connection.openBox("INBOX");

    const searchCriteria = ["ALL"];
    const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: false };
    const messages = await connection.search(searchCriteria, fetchOptions);

    let emails = [];
    for (let item of messages) {
      let all = item.parts.find((part) => part.which === "TEXT");
      
      if (!all) {
        console.warn("⚠️ Email body missing, skipping...");
        continue;
      }

      let parsed = await simpleParser(all.body);
      
      emails.push({
        subject: parsed.subject || "(No Subject)",
        from: parsed.from ? parsed.from.text : "(Unknown Sender)",
        text: parsed.text || "(No Content)",
      });
    }

    await connection.end();
    return emails;
  } catch (error) {
    console.error("❌ IMAP Error:", error);
    throw error;
  }
};

router.get("/inbox", async (req, res) => {
  try {
    console.log("🔍 Fetching emails...");
    
    const emails = await fetchEmails(); // This function should return emails
    console.log("✅ Emails Fetched:", emails);
    
    res.json({ emails });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
