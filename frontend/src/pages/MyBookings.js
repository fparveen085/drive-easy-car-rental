import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem("customer"));

  const [bookings, setBookings] = useState([]);
  const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString("en-GB");
};
  const getCurrentStatus = (booking) => {
  const status = booking.booking_status;

  if (status === "Pending") {
    if (booking.service_type === "Self Drive") {
      return "Waiting for approval";
    }

    return "Waiting for driver assignment";
  }

  if (status === "Approved") {
    if (booking.service_type === "Self Drive") {
      return "Ready for vehicle collection";
    }

    return "Waiting for driver acceptance";
  }

  if (status === "Accepted") {
    if (booking.service_type === "Delivery Only") {
      return "Driver accepted the delivery";
    }

    return "Driver accepted the booking";
  }

  if (status === "In Progress") {
    if (booking.service_type === "Delivery Only") {
      return "Delivery in progress";
    }

    return "Trip in progress";
  }

  if (status === "Completed") {
    return "Completed";
  }

  if (status === "Cancelled") {
    return "Cancelled";
  }

  if (status === "Rejected") {
    return "Rejected";
  }

  return status || "Pending";
};
  useEffect(() => {
    loadBookings();
  // Load once when the page opens for the logged-in customer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/my-bookings/${customer.customer_id}`
      );

      setBookings(response.data);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 p-8">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-4xl font-bold mb-8">
            My Bookings
          </h1>

          {bookings.length === 0 ? (

            <div className="bg-white p-10 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold">
                No bookings found
              </h2>
            </div>

          ) : (

            bookings.map((booking) => (

              <div
                key={booking.booking_id}
                className="bg-white rounded-xl shadow p-6 mb-6"
              >

                <div className="grid md:grid-cols-4 gap-5">

                  <div>

                    {booking.vehicle_image ? (

                      <img
                        src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/uploads/${booking.vehicle_image}`}
                        alt={booking.vehicle_name}
                        className="rounded-xl h-40 w-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x180?text=No+Image";
                        }}
                      />

                    ) : (

                      <div className="h-40 bg-gray-200 rounded-xl flex items-center justify-center text-6xl">
                        🚗
                      </div>

                    )}

                  </div>

                  <div className="md:col-span-2">

                    <h2 className="text-2xl font-bold">
                      {booking.vehicle_name}
                    </h2>

                    <p>
                      {booking.brand} {booking.model}
                    </p>
                    <p className="mt-2">
                      <b>Service:</b> {booking.service_type}
                    </p>

                    <p className="mt-3">
                      <b>Reference:</b> {booking.booking_reference}
                    </p>

                    <p>
                      <b>Pickup:</b> {formatDate(booking.pickup_date)}
                    </p>

                    <p>
                      <b>Return:</b>{" "}
                      {booking.service_type === "Delivery Only"
                        ? "-"
                        : formatDate(booking.return_date)}
                    </p>
                    
                    <p className="text-green-600 font-bold mt-3">
                      RM {booking.total_amount}
                    </p>

                  </div>

                  <div>

                    <p>
                      <b>Booking</b>
                    </p>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {booking.booking_status}
                    </span>

                    <br /><br />

                    <p>
                      <b>Current Status</b>
                    </p>

                    <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                      {getCurrentStatus(booking)}
                    </span>

                    <br /><br />

                    <p>
                      <b>Payment</b>
                    </p>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {booking.payment_status || "Unpaid"}
                    </span>

                    <button
                      onClick={() =>
                        navigate(`/booking-summary/${booking.booking_id}`)
                      }
                      className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg"
                    >
                      View Details
                    </button>

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>
    </>
  );
}

export default MyBookings;
