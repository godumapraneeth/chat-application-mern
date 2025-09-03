import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, totalUnread } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-4 flex justify-between items-center relative">
      <div className="font-bold text-2xl">
        <Link to="/">MyChatApp</Link>
      </div>

      <div className="hidden md:flex gap-6 items-center">
        {user ? (
          <>
            <div className="relative">
              <Link to="/" className="hover:underline">
                Home
              </Link>
              {totalUnread > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {totalUnread}
                </span>
              )}
            </div>
            <span className="font-medium">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-purple-600 px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>

      <div className="md:hidden relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white font-bold text-2xl"
        >
          ☰
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-purple-600 rounded shadow-lg flex flex-col gap-2 p-4 z-50">
            {user ? (
              <>
                <div className="relative">
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="block"
                  >
                    Home
                  </Link>
                  {totalUnread > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                      {totalUnread}
                    </span>
                  )}
                </div>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <span>Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
