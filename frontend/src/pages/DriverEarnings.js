import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function DriverEarnings() {
  const navigate = useNavigate();

  const [driver] = useState(() => {
    try {
      const storedDriver =
        localStorage.getItem("driver");

      return storedDriver
        ? JSON.parse(storedDriver)
        : null;
    } catch (error) {
      console.error(
        "Invalid driver data:",
        error
      );

      return null;
    }
  });

  const [summary, setSummary] = useState({
    completed_trips: 0,
    total_earnings: 0,
    driver_income: 0,
    delivery_income: 0
  });

  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!driver || !driver.driver_id) {
      localStorage.removeItem("driver");
      navigate("/driver/login");
      return;
    }

    loadEarnings();
  // The loader intentionally runs only when the stored driver changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, navigate]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
        `${API_URL}/driver/earnings/${driver.driver_id}`
      );

      setSummary({
        completed_trips: Number(
          response.data.summary
            ?.completed_trips || 0
        ),

        total_earnings: Number(
          response.data.summary
            ?.total_earnings || 0
        ),

        driver_income: Number(
          response.data.summary
            ?.driver_income || 0
        ),

        delivery_income: Number(
          response.data.summary
            ?.delivery_income || 0
        )
      });

      setHistory(
        Array.isArray(response.data.history)
          ? response.data.history
          : []
      );
    } catch (error) {
      console.error(
        "Load earnings error:",
        error.response?.data ||
          error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load earnings"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("driver");
    navigate("/driver/login");
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-MY",
      {
        style: "currency",
        currency: "MYR"
      }
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-MY",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const getStatus = (record) => {
    return (
      record.trip_status ||
      record.booking_status ||
      "Assigned"
    );
  };

  const statusStyle = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (value === "accepted") {
      return "bg-cyan-100 text-cyan-700";
    }

    if (value === "on the way") {
      return "bg-blue-100 text-blue-700";
    }

    if (value === "picked up") {
      return "bg-purple-100 text-purple-700";
    }

    if (
      value === "rejected" ||
      value === "cancelled"
    ) {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const filteredHistory = history.filter(
    (record) => {
      if (filter === "All") {
        return true;
      }

      return (
        record.service_type === filter
      );
    }
  );

  if (!driver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-950 text-white px-6 md:px-10 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            DriveEasy Driver
          </h1>

          <p className="text-gray-300">
            Welcome, {driver.full_name}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/driver/dashboard"
              )
            }
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/driver/jobs")
            }
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            My Jobs
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 py-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">
              My Earnings
            </h2>

            <p className="text-gray-500 mt-2">
              View your completed jobs and
              earnings history.
            </p>
          </div>

          <button
            type="button"
            onClick={loadEarnings}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Refresh Earnings
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-7">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-500">
              Total Earnings
            </p>

            <h3 className="text-3xl font-bold text-green-700 mt-2">
              {formatCurrency(
                summary.total_earnings
              )}
            </h3>

            <p className="text-3xl mt-4">
              💰
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-500">
              Completed Trips
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {summary.completed_trips}
            </h3>

            <p className="text-3xl mt-4">
              ✅
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-600">
            <p className="text-gray-500">
              Driver Service Income
            </p>

            <h3 className="text-3xl font-bold text-purple-700 mt-2">
              {formatCurrency(
                summary.driver_income
              )}
            </h3>

            <p className="text-3xl mt-4">
              🚗
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-500">
              Delivery Income
            </p>

            <h3 className="text-3xl font-bold text-orange-600 mt-2">
              {formatCurrency(
                summary.delivery_income
              )}
            </h3>

            <p className="text-3xl mt-4">
              🚚
            </p>
          </div>
        </section>

        <section className="mt-10 bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Earnings History
              </h2>

              <p className="text-gray-500 mt-1">
                Earnings from your assigned
                bookings.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            >
              <option value="All">
                All Services
              </option>

              <option value="Include Driver">
                Include Driver
              </option>

              <option value="Delivery Only">
                Delivery Only
              </option>
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <h3 className="text-xl font-bold">
                Loading earnings...
              </h3>
            </div>
          ) : filteredHistory.length ===
            0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">
                💵
              </div>

              <h3 className="text-2xl font-bold">
                No earnings found
              </h3>

              <p className="text-gray-500 mt-2">
                Completed job earnings will
                appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-5 py-4">
                      Booking Reference
                    </th>

                    <th className="px-5 py-4">
                      Customer
                    </th>

                    <th className="px-5 py-4">
                      Vehicle
                    </th>

                    <th className="px-5 py-4">
                      Service
                    </th>

                    <th className="px-5 py-4">
                      Pickup Date
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Earnings
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map(
                    (record) => {
                      const status =
                        getStatus(record);

                      const isCompleted =
                        status ===
                        "Completed";

                      return (
                        <tr
                          key={
                            record.booking_id
                          }
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-semibold">
                            {record.booking_reference ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            {record.customer_name ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold">
                              {record.vehicle_name ||
                                "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {record.plate_no ||
                                "-"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {record.service_type ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            {formatDate(
                              record.pickup_date
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td
                            className={`px-5 py-4 font-bold ${
                              isCompleted
                                ? "text-green-700"
                                : "text-gray-400"
                            }`}
                          >
                            {isCompleted
                              ? formatCurrency(
                                  record.driver_earning
                                )
                              : "Not earned yet"}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DriverEarnings;
