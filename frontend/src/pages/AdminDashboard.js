import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_cars: 0,
    total_customers: 0,
    total_bookings: 0,
    total_revenue: 0,
    pending_bookings: 0,
    unread_messages: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/admin/dashboard`
        );

        setStats(response.data);
      } catch (error) {
        console.error("Load dashboard error:", error);

        alert(
          error.response?.data?.message ||
            "Failed to load admin dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/");
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-MY", {
      style: "currency",
      currency: "MYR",
    });
  };

  const notificationBadge = (count) => {
    if (Number(count) <= 0) {
      return null;
    }

    return (
      <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold rounded-full min-w-6 h-6 px-2 flex items-center justify-center">
        {Number(count) > 99 ? "99+" : count}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold">
          Loading Admin Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-950 text-white px-8 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            DriveEasy Admin
          </h1>

          <p className="text-sm text-gray-300">
            Administration Dashboard
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900">
            Admin Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            Monitor system activity and manage DriveEasy operations.
          </p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-500">
              Total Cars
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {stats.total_cars}
            </h3>

            <p className="text-3xl mt-4">
              🚗
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-500">
              Total Customers
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {stats.total_customers}
            </h3>

            <p className="text-3xl mt-4">
              👥
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-500">
              Total Bookings
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {stats.total_bookings}
            </h3>

            <p className="text-3xl mt-4">
              📋
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-600">
            <p className="text-gray-500">
              Total Revenue
            </p>

            <h3 className="text-3xl font-bold mt-2 text-green-700">
              {formatCurrency(stats.total_revenue)}
            </h3>

            <p className="text-3xl mt-4">
              💰
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/manage-cars")
              }
              className="relative bg-white shadow rounded-xl p-6 text-left hover:shadow-lg transition"
            >
              <span className="text-4xl">
                🚗
              </span>

              <h3 className="text-xl font-bold mt-3">
                Manage Cars
              </h3>

              <p className="text-gray-500 mt-1">
                Add, update or remove vehicles.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/manage-bookings")
              }
              className="relative bg-white shadow rounded-xl p-6 text-left hover:shadow-lg transition"
            >
              {notificationBadge(
                stats.pending_bookings
              )}

              <span className="text-4xl">
                📋
              </span>

              <h3 className="text-xl font-bold mt-3">
                Manage Bookings
              </h3>

              <p className="text-gray-500 mt-1">
                Review pending and existing bookings.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/manage-customers")
              }
              className="relative bg-white shadow rounded-xl p-6 text-left hover:shadow-lg transition"
            >
              <span className="text-4xl">
                👥
              </span>

              <h3 className="text-xl font-bold mt-3">
                Manage Customers
              </h3>

              <p className="text-gray-500 mt-1">
                View and manage customer accounts.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/manage-drivers")
              }
              className="relative bg-white shadow rounded-xl p-6 text-left hover:shadow-lg transition"
            >
              <span className="text-4xl">
                🚘
              </span>

              <h3 className="text-xl font-bold mt-3">
                Manage Drivers
              </h3>

              <p className="text-gray-500 mt-1">
                View and manage registered drivers.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/payment-records")
              }
              className="relative bg-white shadow rounded-xl p-6 text-left hover:shadow-lg transition"
            >
              <span className="text-4xl">
                💳
              </span>

              <h3 className="text-xl font-bold mt-3">
                Payment Records
              </h3>

              <p className="text-gray-500 mt-1">
                View customer payment records.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/contact-messages")
              }
              className="relative bg-white shadow rounded-xl p-6 text-left hover:shadow-lg transition"
            >
              {notificationBadge(
                stats.unread_messages
              )}

              <span className="text-4xl">
                ✉️
              </span>

              <h3 className="text-xl font-bold mt-3">
                Contact Messages
              </h3>

              <p className="text-gray-500 mt-1">
                Read customer enquiries and support messages.
              </p>
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/admin/system-settings")
              }
              className="relative bg-white shadow rounded-xl p-6 text-left hover:shadow-lg transition"
            >
              <span className="text-4xl">
                ⚙️
              </span>

              <h3 className="text-xl font-bold mt-3">
                System Settings
              </h3>

              <p className="text-gray-500 mt-1">
                Manage service charges and company information.
              </p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;