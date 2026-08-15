import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManageBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));

    if (!admin) {
      alert("Please login as admin");
      navigate("/admin/login");
      return;
    }

    loadBookings();
  }, [navigate]);

  const loadBookings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/bookings`
      );

      setBookings(response.data);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId,
    action
  ) => {
    const confirmed = window.confirm(
      action === "approve"
        ? "Approve this booking?"
        : "Reject this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/admin/booking/${action}/${bookingId}`
      );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.booking_id === bookingId
            ? {
                ...booking,
                booking_status:
                  action === "approve"
                    ? "Confirmed"
                    : "Cancelled"
              }
            : booking
        )
      );

      alert(
        action === "approve"
          ? "Booking approved successfully"
          : "Booking rejected successfully"
      );
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to update booking"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-MY",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
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

  const bookingStatusStyle = (status) => {
    if (status === "Confirmed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Cancelled") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Completed") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const paymentStatusStyle = (status) => {
    return status === "Paid"
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-700";
  };

  const filteredBookings = bookings.filter(
    (booking) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        booking.booking_reference
          ?.toLowerCase()
          .includes(keyword) ||
        booking.customer_name
          ?.toLowerCase()
          .includes(keyword) ||
        booking.vehicle_name
          ?.toLowerCase()
          .includes(keyword);

      const matchesBookingStatus =
        bookingFilter === "All" ||
        booking.booking_status === bookingFilter;

      const paymentStatus =
        booking.payment_status || "Unpaid";

      const matchesPaymentStatus =
        paymentFilter === "All" ||
        paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesBookingStatus &&
        matchesPaymentStatus
      );
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-bold">
          Loading Bookings...
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
            Manage Bookings
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/dashboard")
          }
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
        >
          Back to Dashboard
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold">
            Booking Management
          </h2>

          <p className="text-gray-500 mt-2">
            Review, approve, and reject customer bookings.
          </p>
        </div>

        <section className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search reference, customer or car"
              className="border rounded-xl px-4 py-3"
            />

            <select
              value={bookingFilter}
              onChange={(event) =>
                setBookingFilter(event.target.value)
              }
              className="border rounded-xl px-4 py-3"
            >
              <option value="All">
                All Booking Status
              </option>
              <option value="Pending">
                Pending
              </option>
              <option value="Confirmed">
                Confirmed
              </option>
              <option value="Completed">
                Completed
              </option>
              <option value="Cancelled">
                Cancelled
              </option>
            </select>

            <select
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value)
              }
              className="border rounded-xl px-4 py-3"
            >
              <option value="All">
                All Payment Status
              </option>
              <option value="Paid">
                Paid
              </option>
              <option value="Unpaid">
                Unpaid
              </option>
            </select>
          </div>
        </section>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h3 className="text-xl font-bold">
              No bookings found
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
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
                      Pickup
                    </th>
                    <th className="px-5 py-4">
                      Return
                    </th>
                    <th className="px-5 py-4">
                      Amount
                    </th>
                    <th className="px-5 py-4">
                      Payment
                    </th>
                    <th className="px-5 py-4">
                      Booking
                    </th>
                    <th className="px-5 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => {
                    const paymentStatus =
                      booking.payment_status ||
                      "Unpaid";

                    return (
                      <tr
                        key={booking.booking_id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 font-semibold">
                          {booking.booking_reference}
                        </td>

                        <td className="px-5 py-4">
                          {booking.customer_name}
                        </td>

                        <td className="px-5 py-4">
                          {booking.vehicle_name}
                        </td>

                        <td className="px-5 py-4">
                          {booking.service_type}
                        </td>

                        <td className="px-5 py-4">
                          {formatDate(
                            booking.pickup_date
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {formatDate(
                            booking.return_date
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatCurrency(
                            booking.total_amount
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentStatusStyle(
                              paymentStatus
                            )}`}
                          >
                            {paymentStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingStatusStyle(
                              booking.booking_status
                            )}`}
                          >
                            {booking.booking_status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {booking.booking_status ===
                          "Pending" ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.booking_id,
                                    "approve"
                                  )
                                }
                                disabled={
                                  paymentStatus !== "Paid"
                                }
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  updateBookingStatus(
                                    booking.booking_id,
                                    "reject"
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageBookings;