import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/admin/login`,
        {
          email,
          password
        }
      );

      localStorage.setItem(
        "admin",
        JSON.stringify(response.data.admin)
      );

      alert(response.data.message);

      navigate("/admin/dashboard");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Admin login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-950 to-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🛠️</div>

          <h1 className="text-3xl font-bold text-slate-900">
            Admin Login
          </h1>

          <p className="text-gray-500 mt-2">
            Sign in to manage DriveEasy
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block font-semibold mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Signing In..." : "Login as Admin"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;