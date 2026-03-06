import { io } from "socket.io-client";

// Dynamically connect to the backend URL defined in .env
// Fallback to 5001 for local development
const URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const socket = io(URL, {
  withCredentials: true,
});

export default socket;
