import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: ""
  });

  const navigate = useNavigate();

  const register = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/register`, form);

      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      alert("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-950 to-blue-900 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Register as a customer to start booking cars
        </p>

        <input
          type="text"
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) =>
            setForm({ ...form, full_name: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <button
          onClick={register}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
        >
          Register
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold"
        >
          ← Back to Login
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold"
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}

export default Register;