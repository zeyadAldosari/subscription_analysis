import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Header() {
  const { auth, logout } = useContext(AuthContext);

  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="group text-xl font-semibold text-white transition-colors duration-200"
        >
          <span className="transition-colors duration-200 group-hover:text-teal-400">
            Subscription
          </span>
          <span className="text-teal-400 transition-colors duration-200 group-hover:text-white">
            Analysis
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1 bg-slate-700 py-1 px-3 rounded-full">
            <span className="text-slate-200 text-sm">
              {auth.user?.username || "User"}
            </span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors duration-200 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
