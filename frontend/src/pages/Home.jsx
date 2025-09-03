import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Chat from "./Chat";

export default function Home() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-200 to-pink-100">
        <p className="text-lg font-semibold text-purple-700">
          You must log in to access the chat.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-100 to-pink-50 p-4">
      <Chat />
    </div>
  );
}
