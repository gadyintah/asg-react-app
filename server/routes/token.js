// server/routes/token.js
const express = require("express");
const twilio = require("twilio");

const router = express.Router();
const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

router.get("/", (req, res) => {
  const identity = req.query.identity || "user_app"; // Default identity

  const accessToken = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_APP_SID, // TwiML App SID
    incomingAllow: true, // Allow incoming calls
  });

  accessToken.addGrant(voiceGrant);

  res.json({ token: accessToken.toJwt() });
});

module.exports = router;