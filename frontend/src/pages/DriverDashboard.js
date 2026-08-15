import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function DriverDashboard() {
  const navigate = useNavigate();

  const [driver] = useState(() => {
    const storedDriver = localStorage.getItem("driver");

    try {
      return storedDriver
        ? JSON.parse(storedDriver)
        : null;
    } catch (error) {
      console.error("Invalid driver data:", error);
      return null;
    }
  });

  const [stats, setStats] = useState({
    total_jobs: 0,
    pending_jobs: 0,
    completed_jobs: 0,
    total_earnings: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [acceptingJobId, setAcceptingJobId] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadDashboard = async () => {
    if (!driver?.driver_id) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const [
        statsResponse,
        jobsResponse,
        availableJobsResponse,
      ] = await Promise.all([
        axios.get(
          `${API_URL}/driver/dashboard/${driver.driver_id}`
        ),

        axios.get(
          `${API_URL}/driver/jobs/${driver.driver_id}`
        ),

        axios.get(
          `${API_URL}/driver/available-jobs`
        ),
      ]);

      setStats({
        total_jobs: Number(
          statsResponse.data.total_jobs || 0
        ),

        pending_jobs: Number(
          statsResponse.data.pending_jobs || 0
        ),

        completed_jobs: Number(
          statsResponse.data.completed_jobs || 0
        ),

        total_earnings: Number(
          statsResponse.data.total_earnings || 0
        ),
      });

      setJobs(
        Array.isArray(jobsResponse.data)
          ? jobsResponse.data
          : []
      );

      setAvailableJobs(
        Array.isArray(availableJobsResponse.data)
          ? availableJobsResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Driver dashboard error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load driver dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!driver || !driver.driver_id) {
      localStorage.removeItem("driver");
      navigate("/driver/login");
      return;
    }

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, navigate]);

  const handleAcceptJob = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to accept this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setAcceptingJobId(bookingId);

      const response = await axios.put(
        `${API_URL}/driver/accept-job/${bookingId}`,
        {
          driver_id: driver.driver_id,
        }
      );

      alert(
        response.data.message ||
          "Job accepted successfully"
      );

      await loadDashboard();
    } catch (error) {
      console.error(
        "Accept job error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to accept job"
      );
    } finally {
      setAcceptingJobId(null);
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
        currency: "MYR",
      }
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    return String(time).slice(0, 5);
  };

  const statusStyle = (status) => {
    const currentStatus = String(
      status || ""
    ).toLowerCase();

    if (currentStatus === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (
      currentStatus === "on the way" ||
      currentStatus === "on_the_way" ||
      currentStatus === "driver on the way"
    ) {
      return "bg-blue-100 text-blue-700";
    }

    if (
      currentStatus === "picked up" ||
      currentStatus === "picked_up" ||
      currentStatus === "in progress"
    ) {
      return "bg-purple-100 text-purple-700";
    }

    if (
      currentStatus === "accepted" ||
      currentStatus === "driver accepted"
    ) {
      return "bg-cyan-100 text-cyan-700";
    }

    if (
      currentStatus === "cancelled" ||
      currentStatus === "rejected" ||
      currentStatus === "driver rejected"
    ) {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (!driver) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🚗</div>

          <h2 className="text-2xl font-bold text-slate-900">
            Loading Driver Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-slate-950 text-white px-8 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {driver.driver_photo ? (
            <img
              src={`${API_URL}/uploads/${driver.driver_photo}`}
              alt={driver.full_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
              👤
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold">
              DriveEasy Driver
            </h1>

            <p className="text-gray-300">
              Welcome, {driver.full_name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadDashboard}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold transition"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900">
            Driver Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            View available jobs, assigned trips and
            earnings.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-8 bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-xl">
            <p className="font-semibold">
              Dashboard could not be loaded
            </p>

            <p className="mt-1">{errorMessage}</p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-500">
              Total Assigned Jobs
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {stats.total_jobs}
            </h3>

            <p className="text-3xl mt-4">📋</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-500">
              Pending Jobs
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {stats.pending_jobs}
            </h3>

            <p className="text-3xl mt-4">⏳</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-500">
              Completed Trips
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {stats.completed_jobs}
            </h3>

            <p className="text-3xl mt-4">✅</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-600">
            <p className="text-gray-500">
              Total Earnings
            </p>

            <h3 className="text-3xl font-bold mt-2 text-green-700">
              {formatCurrency(
                stats.total_earnings
              )}
            </h3>

            <p className="text-3xl mt-4">💰</p>
          </div>
        </section>

        {/* Available Jobs */}
        <section className="mt-10 bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Available Jobs
              </h2>

              <p className="text-gray-500 mt-1">
                Accept customer bookings that require a
                driver.
              </p>
            </div>

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
              {availableJobs.length} Available
            </span>
          </div>

          {availableJobs.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-6xl mb-4">
                🚕
              </div>

              <h3 className="text-xl font-bold">
                No available jobs
              </h3>

              <p className="text-gray-500 mt-2">
                New driver-required bookings will appear
                here.
              </p>

              <button
                type="button"
                onClick={loadDashboard}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                Refresh Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {availableJobs.map((job) => (
                <article
                  key={job.booking_id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition"
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        Booking Reference
                      </p>

                      <h3 className="text-xl font-bold text-slate-900">
                        {job.booking_reference || "-"}
                      </h3>
                    </div>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {job.service_type || "-"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Customer
                      </p>

                      <p className="font-semibold">
                        {job.customer_name || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Customer Phone
                      </p>

                      <p className="font-semibold">
                        {job.customer_phone || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Vehicle
                      </p>

                      <p className="font-semibold">
                        {job.vehicle_name || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Plate Number
                      </p>

                      <p className="font-semibold">
                        {job.plate_no || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Pickup Date
                      </p>

                      <p className="font-semibold">
                        {formatDate(job.pickup_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Pickup Time
                      </p>

                      <p className="font-semibold">
                        {formatTime(job.pickup_time)}
                      </p>
                    </div>

                    {job.return_date && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Return Date
                        </p>

                        <p className="font-semibold">
                          {formatDate(job.return_date)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">
                        Pickup Location
                      </p>

                      <p className="font-semibold mt-1">
                        {job.pickup_location || "-"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">
                        Drop-off Location
                      </p>

                      <p className="font-semibold mt-1">
                        {job.dropoff_location || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Estimated Earnings
                      </p>

                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(
                          job.driver_earning
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleAcceptJob(
                          job.booking_id
                        )
                      }
                      disabled={
                        acceptingJobId ===
                        job.booking_id
                      }
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition"
                    >
                      {acceptingJobId ===
                      job.booking_id
                        ? "Accepting..."
                        : "Accept Job"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Recent Assigned Jobs */}
        <section className="mt-10 bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Recent Assigned Jobs
              </h2>

              <p className="text-gray-500 mt-1">
                View the latest jobs you accepted.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/driver/jobs")
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              View All Jobs
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-6xl mb-4">
                🚖
              </div>

              <h3 className="text-xl font-bold">
                No jobs accepted
              </h3>

              <p className="text-gray-500 mt-2">
                Accept an available job to see it here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-5 py-4">
                      Reference
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
                  {jobs
                    .slice(0, 5)
                    .map((job) => {
                      const displayedStatus =
                        job.trip_status ||
                        job.booking_status ||
                        "Assigned";

                      return (
                        <tr
                          key={job.booking_id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-semibold">
                            {job.booking_reference ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold">
                              {job.customer_name ||
                                "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {job.customer_phone ||
                                "-"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold">
                              {job.vehicle_name ||
                                "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {job.plate_no || "-"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {job.service_type ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            {formatDate(
                              job.pickup_date
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle(
                                displayedStatus
                              )}`}
                            >
                              {displayedStatus}
                            </span>
                          </td>

                          <td className="px-5 py-4 font-semibold text-green-700">
                            {formatCurrency(
                              job.driver_earning
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button
              type="button"
              onClick={() =>
                navigate("/driver/jobs")
              }
              className="bg-white shadow rounded-xl p-6 text-left hover:shadow-lg hover:-translate-y-1 transition"
            >
              <span className="text-4xl">📋</span>

              <h3 className="text-xl font-bold mt-3">
                My Jobs
              </h3>

              <p className="text-gray-500 mt-1">
                View and update your accepted trips.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/driver/earnings")
              }
              className="bg-white shadow rounded-xl p-6 text-left hover:shadow-lg hover:-translate-y-1 transition"
            >
              <span className="text-4xl">💰</span>

              <h3 className="text-xl font-bold mt-3">
                My Earnings
              </h3>

              <p className="text-gray-500 mt-1">
                View completed trips and income.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/driver/profile")
              }
              className="bg-white shadow rounded-xl p-6 text-left hover:shadow-lg hover:-translate-y-1 transition"
            >
              <span className="text-4xl">👤</span>

              <h3 className="text-xl font-bold mt-3">
                My Profile
              </h3>

              <p className="text-gray-500 mt-1">
                View your driver and licence details.
              </p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DriverDashboard;