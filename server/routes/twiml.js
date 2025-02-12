// server/routes/twiml.js
const express = require("express");
const twilio = require("twilio");

const router = express.Router();

router.post("/outbound", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const dial = twiml.dial();

  if (req.body.To.startsWith("client:")) {
    dial.client(req.body.To.replace("client:", ""));
  } else {
    dial.number(req.body.To);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});


module.exports = router;