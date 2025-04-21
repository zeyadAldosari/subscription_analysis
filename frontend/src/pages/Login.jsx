import { useState, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth, login } = useContext(AuthContext);

  if (auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/login/",
        formData
      );
      login(response.data.access, response.data.user);
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Subscription<span className="text-teal-400">Analysis</span>
          </h1>
        </div>

        <div className="bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold text-slate-200 mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-900/50 border border-rose-700 text-rose-200 rounded-md">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-rose-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-400 transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-400 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 text-white bg-teal-500 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-8"></div>
      </div>
    </div>
  );
}

export default Login;
