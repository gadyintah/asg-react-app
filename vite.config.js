import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allows external access
    port: 5173, // Your Vite server port
    strictPort: true, // Ensures the port stays fixed
    cors: true, // Enables CORS
    allowedHosts: ["http://192.168.1.10"], // Replace with your Ngrok URL
  },
});
