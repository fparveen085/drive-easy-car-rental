import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function DriverJobs() {
  const navigate = useNavigate();

  const [driver] = useState(() => {
    try {
      const storedDriver = localStorage.getItem("driver");

      return storedDriver
        ? JSON.parse(storedDriver)
        : null;
    } catch (error) {
      console.error("Invalid driver data:", error);
      return null;
    }
  });

  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!driver || !driver.driver_id) {
      localStorage.removeItem("driver");
      navigate("/driver/login");
      return;
    }

    loadJobs();
  // The loader intentionally runs only when the stored driver changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, navigate]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
        `${API_URL}/driver/jobs/${driver.driver_id}`
      );

      setJobs(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Load driver jobs error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load assigned jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (
    bookingId,
    newStatus
  ) => {
    const confirmationMessages = {
      Accepted: "Accept this assigned job?",
      Rejected: "Reject this assigned job?",
      "On The Way": "Confirm that you are on the way?",
      "Picked Up":
        "Confirm that the customer or vehicle has been picked up?",
      Completed:
        "Confirm that this job has been completed?"
    };

    const confirmed = window.confirm(
      confirmationMessages[newStatus] ||
        `Update this job to ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(bookingId);

      const response = await axios.put(
        `${API_URL}/driver/jobs/${bookingId}/status`,
        {
          driver_id: driver.driver_id,
          trip_status: newStatus
        }
      );

      alert(response.data.message);

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          Number(job.booking_id) ===
          Number(bookingId)
            ? {
                ...job,
                trip_status:
                  response.data.booking.trip_status,
                booking_status:
                  response.data.booking.booking_status
              }
            : job
        )
      );
    } catch (error) {
      console.error(
        "Update job status error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update job status"
      );
    } finally {
      setUpdatingId(null);
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

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    return String(time).slice(0, 5);
  };

  const getStatus = (job) => {
    return (
      job.trip_status ||
      job.booking_status ||
      "Assigned"
    );
  };

  const statusStyle = (status) => {
    const value = String(status || "").toLowerCase();

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

  const filteredJobs = jobs.filter((job) => {
    if (filter === "All") {
      return true;
    }

    return getStatus(job) === filter;
  });

  const renderActionButtons = (job) => {
    const status = getStatus(job);
    const isUpdating =
      Number(updatingId) === Number(job.booking_id);

    if (status === "Assigned") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              updateJobStatus(
                job.booking_id,
                "Accepted"
              )
            }
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Accept
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              updateJobStatus(
                job.booking_id,
                "Rejected"
              )
            }
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Reject
          </button>
        </div>
      );
    }

    if (status === "Accepted") {
      return (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() =>
            updateJobStatus(
              job.booking_id,
              "On The Way"
            )
          }
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Start Journey
        </button>
      );
    }

    if (status === "On The Way") {
      return (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() =>
            updateJobStatus(
              job.booking_id,
              "Picked Up"
            )
          }
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Confirm Pickup
        </button>
      );
    }

    if (status === "Picked Up") {
      return (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() =>
            updateJobStatus(
              job.booking_id,
              "Completed"
            )
          }
          className="bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Complete Job
        </button>
      );
    }

    if (status === "Completed") {
      return (
        <span className="text-green-700 font-semibold">
          Job completed
        </span>
      );
    }

    if (status === "Rejected") {
      return (
        <span className="text-red-600 font-semibold">
          Job rejected
        </span>
      );
    }

    return (
      <span className="text-gray-500">
        No action available
      </span>
    );
  };

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
              navigate("/driver/dashboard")
            }
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold"
          >
            Dashboard
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
              My Jobs
            </h2>

            <p className="text-gray-500 mt-2">
              View and update your assigned bookings.
            </p>
          </div>

          <button
            type="button"
            onClick={loadJobs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Refresh Jobs
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-5 mb-7">
          <p className="font-semibold mb-3">
            Filter by status
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "All",
              "Assigned",
              "Accepted",
              "On The Way",
              "Picked Up",
              "Completed",
              "Rejected"
            ].map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  filter === status
                    ? "bg-slate-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-6">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <h3 className="text-xl font-bold">
              Loading jobs...
            </h3>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">🚖</div>

            <h3 className="text-2xl font-bold">
              No jobs found
            </h3>

            <p className="text-gray-500 mt-2">
              There are no jobs under the selected
              status.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => {
              const status = getStatus(job);

              return (
                <div
                  key={job.booking_id}
                  className="bg-white rounded-2xl shadow overflow-hidden"
                >
                  <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <p className="text-gray-300 text-sm">
                        Booking Reference
                      </p>

                      <h3 className="text-xl font-bold">
                        {job.booking_reference || "-"}
                      </h3>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-full font-semibold ${statusStyle(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div>
                        <p className="text-gray-500 text-sm">
                          Customer
                        </p>

                        <p className="font-semibold mt-1">
                          {job.customer_name || "-"}
                        </p>

                        <p className="text-gray-600">
                          {job.customer_phone || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm">
                          Vehicle
                        </p>

                        <p className="font-semibold mt-1">
                          {job.vehicle_name || "-"}
                        </p>

                        <p className="text-gray-600">
                          {job.plate_no || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm">
                          Service Type
                        </p>

                        <p className="font-semibold mt-1">
                          {job.service_type || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm">
                          Driver Earnings
                        </p>

                        <p className="font-bold text-green-700 mt-1">
                          {formatCurrency(
                            job.driver_earning
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm">
                          Pickup Date
                        </p>

                        <p className="font-semibold mt-1">
                          {formatDate(job.pickup_date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm">
                          Pickup Time
                        </p>

                        <p className="font-semibold mt-1">
                          {formatTime(job.pickup_time)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm">
                          Return Date
                        </p>

                        <p className="font-semibold mt-1">
                          {formatDate(job.return_date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-sm">
                          Booking Status
                        </p>

                        <p className="font-semibold mt-1">
                          {job.booking_status || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 text-sm">
                          Pickup Location
                        </p>

                        <p className="font-semibold mt-1 break-words">
                          {job.pickup_location || "-"}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 text-sm">
                          Drop-off Location
                        </p>

                        <p className="font-semibold mt-1 break-words">
                          {job.dropoff_location || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t mt-6 pt-5">
                      <p className="text-gray-500 text-sm mb-3">
                        Job Action
                      </p>

                      {renderActionButtons(job)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default DriverJobs;
