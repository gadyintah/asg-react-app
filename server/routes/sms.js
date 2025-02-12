const express = require("express");
const router = express.Router();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Fetch SMS Logs
router.get("/logs", async (req, res) => {
  try {
    const messages = await client.messages.list({ limit: 10 }); // Fetch last 10 messages
    res.json(messages);
  } catch (error) {
    console.error("Error fetching SMS logs:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fetch SMS Logs (Inbox)
router.get("/inbox", async (req, res) => {
  try {
    const messages = await client.messages.list({ to: process.env.TWILIO_PHONE_NUMBER, limit: 20 });

    const inbox = messages.map((msg) => ({
      from: msg.from,
      to: msg.to,
      text: msg.body,
      dateSent: msg.dateSent,
    }));

    console.log("📥 SMS Inbox:", inbox);
    res.json({ results: inbox });
  } catch (error) {
    console.error("Error fetching SMS inbox:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Send SMS
router.post("/send", async (req, res) => {
  try {
    const { to, text } = req.body;

    const message = await client.messages.create({
      body: text,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio number
      to,
    });

    console.log("✅ SMS Sent:", message.sid);
    res.json({ success: true, sid: message.sid });
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Receive SMS (Twilio Webhook)
router.post("/receive", async (req, res) => {
  try {
    const { From, To, Body } = req.body; // Twilio sends data in this format

    console.log("📥 SMS Received:", { from: From, to: To, text: Body });

    res.json({ success: true, message: "SMS received", data: { from: From, to: To, text: Body } });
  } catch (error) {
    console.error("Error receiving SMS:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
