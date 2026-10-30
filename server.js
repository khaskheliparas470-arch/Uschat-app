
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

app.get("/", (req, res) => {
  res.send("UsChat calling server is running");
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("register-user", (userId) => {
    if (!userId) return;

    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;

    socket.emit("registered", { userId });
  });

  socket.on("call-user", ({ to, offer, callType, fromName }) => {
    const receiverSocket = onlineUsers.get(to);

    if (!receiverSocket) {
      socket.emit("call-unavailable", { userId: to });
      return;
    }

    io.to(receiverSocket).emit("incoming-call", {
      from: socket.data.userId,
      fromName,
      offer,
      callType,
    });
  });

  socket.on("answer-call", ({ to, answer }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket) {
      io.to(receiverSocket).emit("call-answered", {
        answer,
        from: socket.data.userId,
      });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket) {
      io.to(receiverSocket).emit("ice-candidate", {
        candidate,
        from: socket.data.userId,
      });
    }
  });

  socket.on("reject-call", ({ to }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket) {
      io.to(receiverSocket).emit("call-rejected");
    }
  });

  socket.on("end-call", ({ to }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket) {
      io.to(receiverSocket).emit("call-ended");
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.data.userId;

    if (userId && onlineUsers.get(userId) === socket.id) {
      onlineUsers.delete(userId);
    }

    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`UsChat server running on port ${PORT}`);
});
