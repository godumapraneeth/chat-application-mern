import Message from "../models/Message.js";

// Utility: generate unique room ID for two users
const getRoomId = (user1, user2) => {
  return [user1, user2].sort().join("_"); // ensures consistent order
};

// Send TEXT message
export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;

    if (!content || !receiverId) {
      return res
        .status(400)
        .json({ message: "content and receiverId are required" });
    }

    const room = getRoomId(req.user._id.toString(), receiverId);
    const message = await Message.create({
      sender: req.user._id,
      content,
      type: "text",
      room,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get chat history
export const getMessages = async (req, res) => {

      const skip=parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;
  try {
    const { receiverId } = req.params;
    const room = getRoomId(req.user._id.toString(), receiverId);

    const messages = await Message.find({ room })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send IMAGE message
export const sendImageMessage = async (req, res) => {
  try {
    if (!req.file || !req.body.receiverId) {
      return res
        .status(400)
        .json({ message: "Image and receiverId are required" });
    }

    const room = getRoomId(req.user._id.toString(), req.body.receiverId);

    const message = await Message.create({
      sender: req.user._id,
      imageUrl: `/uploads/${req.file.filename}`,
      type: "image",
      room,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
