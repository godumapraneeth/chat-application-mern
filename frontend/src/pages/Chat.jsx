import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import { sendMessage as sendMessageApi, getMessages,sendImageMessage } from "../api/api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_URL);

export default function Chat() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setUsers(data.filter((u) => u._id !== user._id));
    };
    fetchUsers();
  }, [user]);

  // Select receiver + load history
  const selectReceiver = async (u) => {
  setReceiver(u);
  setMessages([]);
  socket.emit("joinRoom", { userId: user._id, receiverId: u._id });

  const res = await getMessages(u._id, user.token); // ✅ pass receiverId + token
  const normalized = res.data.map((m) => ({
    sender: m.sender?._id || m.sender,
    receiver: m.receiver?._id || m.receiver,
    content: m.content,
    imageUrl: m.imageUrl || null,
    type: m.type || "text",
    createdAt: m.createdAt,
  }));

  setMessages(normalized);
  scrollToBottom();
  setUnreadCounts((prev) => ({ ...prev, [u._id]: 0 }));
};

  // Listen for new messages
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (msg.sender === receiver?._id || msg.receiver === receiver?._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      } else {
        setUnreadCounts((prev) => {
          const newCounts = { ...prev, [msg.sender]: (prev[msg.sender] || 0) + 1 };
          setTotalUnread(Object.values(newCounts).reduce((a, b) => a + b, 0));
          return newCounts;
        });
      }
    });

    return () => socket.off("receiveMessage");
  }, [receiver]);

  // Scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send text
const handleSendMessage = async () => {
  if (!message.trim() || !receiver) return;

  const res = await sendMessage(
    { receiverId: receiver._id, content: message, type: "text" },
    user.token
  );

  const msgData = {
    sender: user._id,
    receiver: receiver._id,
    content: message,
    type: "text",
    createdAt: res.data.createdAt,
  };

  socket.emit("sendMessage", msgData);
  setMessages((prev) => [...prev, msgData]);
  setMessage("");
};

  // Send image
  const sendImage = async (e) => {
  const file = e.target.files[0];
  if (!file || !receiver) return;

  const formData = new FormData();
  formData.append("image", file);
  formData.append("receiverId", receiver._id);

  const res = await sendImageMessage(formData, user.token);

  const msgData = {
    sender: user._id,
    receiver: receiver._id,
    imageUrl: res.data.imageUrl,
    type: "image",
    createdAt: res.data.createdAt,
  };

  socket.emit("sendMessage", msgData);
  setMessages((prev) => [...prev, msgData]);
};


  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex h-full gap-4 p-4 bg-gradient-to-br from-purple-100 to-pink-50 rounded-xl shadow-lg">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded-tr-3xl rounded-br-3xl shadow-xl overflow-y-auto p-4">
        <h3 className="font-bold mb-4 text-xl text-purple-700">Contacts</h3>
        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => selectReceiver(u)}
            className={`flex items-center justify-between gap-3 p-3 mb-2 rounded-lg cursor-pointer transition-all duration-300
              ${receiver?._id === u._id ? "bg-purple-200 scale-105" : "hover:bg-purple-100 hover:scale-105"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-400 text-white rounded-full flex items-center justify-center font-bold">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{u.name}</span>
            </div>
            {unreadCounts[u._id] > 0 && receiver?._id !== u._id && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                {unreadCounts[u._id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-tl-3xl rounded-bl-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b font-bold bg-purple-600 text-white">
          {receiver ? `Chat with ${receiver.name}` : "Select a contact"}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gradient-to-b from-purple-50 to-pink-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === user._id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words shadow relative
                  ${msg.sender === user._id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none shadow-lg"
                    : "bg-white text-black rounded-bl-none shadow-sm"}`}
              >
                {msg.type === "text" && <div>{msg.content}</div>}
                {msg.type === "image" && (
                  <img
                    src={`${API_URL}${msg.imageUrl}`}
                    alt="chat"
                    className="rounded-lg max-w-[200px]"
                  />
                )}
                <div className="text-xs mt-1 text-black text-right">
                  {msg.createdAt ? formatTime(msg.createdAt) : ""}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {receiver && (
          <div className="p-4 flex gap-2 border-t bg-gray-50">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="border p-2 flex-grow rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="file"
              accept="image/*"
              onChange={sendImage}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="bg-purple-200 px-3 rounded-full cursor-pointer flex items-center hover:bg-purple-300 transition"
            >
              📷
            </label>
            <button
              onClick={handleSendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full transition-all duration-200"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
