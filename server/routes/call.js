const express = require("express");
const twilio = require("twilio");

const router = express.Router();
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const VoiceResponse = twilio.twiml.VoiceResponse;

router.post("/outbound", async (req, res) => {
  const { to } = req.body;

  try {
    const call = await client.calls.create({
      url: `${process.env.SERVER_URL}/api/call/twiml/outbound`, // Ensure SERVER_URL is properly used
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to.startsWith("+") ? to : `client:${to}`,
    });

    res.json({ success: true, callId: call.sid });
  } catch (error) {
    console.error("Twilio Outbound Call Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TwiML for outbound calls (web client -> web client or phone)
router.post("/twiml/outbound", (req, res) => {
  const twiml = new VoiceResponse();
  const dial = twiml.dial();

  if (req.body.To.startsWith("client:")) {
    dial.client(req.body.To.replace("client:", ""));
  } else {
    dial.number(req.body.To);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// TwiML for inbound calls (phone -> web app)
router.post("/inbound", (req, res) => {
  const twiml = new VoiceResponse();
  const identity = "user-app";
  const dial = twiml.dial();
  dial.client(identity);

  res.type("text/xml");
  res.send(twiml.toString());
});

module.exports = router;
