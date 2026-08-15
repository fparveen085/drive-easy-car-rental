import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/login`,
        {
          email: email.trim(),
          password,
        }
      );

      localStorage.setItem(
        "customer",
        JSON.stringify(response.data.user)
      );

      alert(response.data.message || "Login successful.");

      const pendingSearch =
        sessionStorage.getItem("pendingCarSearch");

      if (pendingSearch) {
        const searchDetails = JSON.parse(pendingSearch);

        sessionStorage.removeItem("pendingCarSearch");

        navigate("/cars", {
          state: searchDetails,
        });
      } else {
        navigate("/cars");
      }
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Invalid Email or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-950 to-blue-900 px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-7 md:p-8">
        <div className="text-center mb-7">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
            🚗
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Customer Login
          </h1>

          <p className="text-gray-500 mt-2">
            Login to book your rental car
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-700 hover:text-blue-900 disabled:text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-blue-700 hover:text-blue-900 font-medium"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/register")}
          disabled={loading}
          className="w-full border border-green-600 text-green-700 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-400 py-3 rounded-lg font-semibold transition"
        >
          Register New Account
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          disabled={loading}
          className="w-full mt-4 text-gray-600 hover:text-gray-900 py-2 font-semibold transition"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Login;