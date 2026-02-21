import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    socket.on("seatBooked", (data) => {
      io.emit("seatUpdated", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export const getIO = () => io;
