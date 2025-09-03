import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

export const sendMessage = (data, token) =>
  API.post("/messages", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMessages = (receiverId, token) =>
  API.get(`/messages/${receiverId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendImageMessage = (formData, token) =>
  API.post("/messages/image", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
