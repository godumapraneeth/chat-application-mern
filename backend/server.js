import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import Message from "./models/Message.js"; 
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error", err));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", authRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/users",userRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("joinRoom", ({ senderId, receiverId }) => {

    const room = [senderId, receiverId].sort().join("_");

    socket.join(room);
    console.log(`${socket.id} joined room ${room}`);
  });


  socket.on("chatMessage", async (data) => {
    try {
      const room = [data.sender, data.receiver].sort().join("_");

      const newMessage = await Message.create({
        sender: data.sender,
        content: data.content,
        room,
      });
oom
      io.to(room).emit("chatMessage", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
