import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DriverLogin() {
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
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/driver/login`,
        {
          email,
          password
        }
      );

      localStorage.removeItem("customer");
      localStorage.removeItem("admin");

      localStorage.setItem(
        "driver",
        JSON.stringify(response.data.driver)
      );

      alert(response.data.message);

      navigate("/driver/dashboard");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Driver login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-950 to-green-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🚖</div>

          <h1 className="text-3xl font-bold text-slate-900">
            Driver Login
          </h1>

          <p className="text-gray-500 mt-2">
            Login to manage your assigned trips
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
              placeholder="driver@gmail.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
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
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Signing In..." : "Login as Driver"}
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

export default DriverLogin;