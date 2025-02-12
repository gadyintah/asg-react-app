import React, { useEffect, useState } from "react";
import { Device } from "@twilio/voice-sdk";

const SERVER_URL = "https://d405-136-158-103-53.ngrok-free.app";

function CallComponent() {
  const [device, setDevice] = useState(null);
  const [incomingConnection, setIncomingConnection] = useState(null);
  const [to, setTo] = useState("");
  const [calling, setCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [activeConnection, setActiveConnection] = useState(null); // Track active call

  useEffect(() => {
    async function setupTwilioDevice() {
      try {
        const response = await fetch(`${SERVER_URL}/api/call/token?identity=user_app`);
        const data = await response.json();
        console.log("Twilio Token:", data.token);

        const newDevice = new Device(data.token, { logLevel: "info" });
        newDevice.register();

        newDevice.on("ready", () => {
          console.log(`Twilio Device Ready for ${data.identity}`);
        });

        newDevice.on("incoming", (conn) => {
          console.log("Incoming call detected:", conn.parameters);
          setIncomingConnection(conn);
          setIncomingCall(true);
        });

        newDevice.on("error", (error) => {
          console.error("Twilio Device Error:", error);
        });

        setDevice(newDevice);
      } catch (error) {
        console.error("Twilio Device Setup Error:", error);
      }
    }

    setupTwilioDevice();

    // Cleanup on unmount
    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, []);

  const acceptCall = () => {
    if (incomingConnection) {
      incomingConnection.accept();
      setupCallListeners(incomingConnection);
      setActiveConnection(incomingConnection); // Set active connection
      setIncomingCall(false);
    }
  };

  const rejectCall = () => {
    if (incomingConnection) {
      incomingConnection.reject();
      setIncomingCall(false);
    }
  };

  const endCall = () => {
    if (activeConnection) {
      activeConnection.disconnect();
      setActiveConnection(null); // Clear active connection
    }
  };

  const setupCallListeners = (conn) => {
    conn.on("accept", () => {
      console.log("Call accepted");
      // Attach audio elements for speaking/listening
      conn.on("disconnect", () => {
        console.log("Call disconnected");
        setActiveConnection(null); // Clear active connection
      });
      conn.on("error", (error) => {
        console.error("Call error:", error);
        setActiveConnection(null); // Clear active connection
      });
    });
  };

  const makeCall = async () => {
    if (!to) {
      alert("Please enter a phone number.");
      return;
    }

    try {
      setCalling(true);
      const response = await fetch(`${SERVER_URL}/api/call/outbound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Call initiated!");
      } else {
        alert("Failed to initiate call: " + data.error);
      }
    } catch (error) {
      console.error("Twilio Call Error:", error);
      alert("Failed to initiate call");
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-80 bg-white shadow-xl rounded-2xl p-5">
        <h2 className="text-center text-lg font-bold text-gray-700 mb-4">Make a Call</h2>
        <input
          type="text"
          placeholder="Enter phone number"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 text-lg text-center"
        />
        <button
          onClick={makeCall}
          disabled={calling}
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          {calling ? "Calling..." : "Call"}
        </button>
      </div>

      {/* Incoming Call Prompt */}
      {incomingCall && (
        <div className="fixed bottom-10 bg-white shadow-lg p-4 rounded-lg flex flex-col items-center">
          <p className="mb-2">Incoming call...</p>
          <button onClick={acceptCall} className="bg-green-500 text-white px-4 py-2 rounded-lg mb-2">
            Accept
          </button>
          <button onClick={rejectCall} className="bg-red-500 text-white px-4 py-2 rounded-lg">
            Reject
          </button>
        </div>
      )}

      {/* Active Call Controls */}
      {activeConnection && (
        <div className="fixed bottom-10 bg-white shadow-lg p-4 rounded-lg flex flex-col items-center">
          <p className="mb-2">Active call...</p>
          <button onClick={endCall} className="bg-red-500 text-white px-4 py-2 rounded-lg">
            End Call
          </button>
        </div>
      )}
    </div>
  );
}

export default CallComponent;