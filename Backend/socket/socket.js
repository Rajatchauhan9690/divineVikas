import { Server } from "socket.io";

let io = null;

/*
========================================
SOCKET INITIALIZATION
========================================
*/

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Socket Connected:", socket.id);

    /*
    Join session room for seat realtime updates
    */

    socket.on("join-session", (sessionId) => {
      console.log("👥 Join Session Room:", sessionId);

      socket.join(sessionId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);
    });
  });

  console.log("✅ Socket Server Initialized");
};

/*
========================================
GET SOCKET INSTANCE
========================================
*/

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};
