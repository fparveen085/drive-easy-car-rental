import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function BookingSummary() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/booking/${bookingId}`
        );

        console.log(response.data);
        setBooking(response.data);
      } catch (err) {
        console.log(err);

        if (err.response) {
          alert(err.response.data.message);
        } else {
          alert("Failed to load booking summary.");
        }

        navigate("/cars");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          <h2 className="text-3xl font-bold">
            Loading Booking Summary...
          </h2>
        </div>
      </>
    );
  }

  if (!booking) {
    return null;
  }

  const getVehicleImage = () => {
    if (!booking.vehicle_image) {
      return null;
    }

    if (
      booking.vehicle_image.startsWith("http://") ||
      booking.vehicle_image.startsWith("https://")
    ) {
      return booking.vehicle_image;
    }

    return `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/uploads/${booking.vehicle_image}`;
  };

  const vehicleImage = getVehicleImage();
  const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB");
};
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-10 px-5">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold mb-2">
            Booking Summary
          </h1>

          <p className="text-gray-500 mb-8">
            Please review your booking before payment.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {/* LEFT SIDE */}

            <div>
              {vehicleImage ? (
                <img
                  src={vehicleImage}
                  alt={booking.vehicle_name}
                  className="w-full h-80 rounded-xl object-cover shadow"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextElementSibling.style.display =
                      "flex";
                  }}
                />
              ) : null}

              <div
                className="w-full h-80 rounded-xl bg-gray-200 items-center justify-center text-8xl"
                style={{
                  display: vehicleImage ? "none" : "flex",
                }}
              >
                🚗
              </div>

              <h2 className="text-3xl font-bold mt-5">
                {booking.vehicle_name}
              </h2>

              <p className="text-gray-500">
                {booking.brand} {booking.model}
              </p>
            </div>

            {/* RIGHT SIDE */}

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex justify-between gap-5">
                  <span>Booking Reference</span>

                  <span className="font-bold text-right">
                    {booking.booking_reference}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span>Customer</span>

                  <span className="font-semibold text-right">
                    {booking.customer_name || booking.full_name}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span>Service Type</span>

                  <span className="font-semibold text-right">
                    {booking.service_type}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span>Pickup Date</span>

                  <span className="text-right">
                    {formatDate(booking.pickup_date)}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span>Pickup Time</span>

                  <span className="text-right">
                    {booking.pickup_time || "Now"}
                  </span>
                </div>

                {booking.service_type !== "Delivery Only" && (
                  <div className="flex justify-between gap-5">
                    <span>Return Date</span>

                    <span className="text-right">
                      {formatDate(booking.return_date)}
                    </span>
                  </div>
                )}

                <hr />

                <div>
                  <p className="font-semibold">
                    Pickup Location
                  </p>

                  <p className="text-gray-600 text-sm mt-1">
                    {booking.pickup_location}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">
                    Drop Location
                  </p>

                  <p className="text-gray-600 text-sm mt-1">
                    {booking.dropoff_location}
                  </p>
                </div>

                {booking.service_type === "Delivery Only" && (
                  <>
                    <hr />

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="font-bold text-blue-800 mb-3">
                        Baggage Information
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between gap-5">
                          <span>Baggage Quantity</span>

                          <span className="font-bold">
                            {booking.baggage_qty || 0} item(s)
                          </span>
                        </div>

                        <div className="flex justify-between gap-5">
                          <span>Large Baggage</span>

                          <span className="font-semibold">
                            {booking.large_baggage || "No"}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold">
                            Special Instruction
                          </p>

                          <p className="text-gray-600 text-sm mt-1">
                            {booking.special_instruction ||
                              "No special instruction"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <hr />

                {booking.service_type !== "Delivery Only" && (
                  <>
                    <div className="flex justify-between gap-5">
                      <span>Rental Days</span>

                      <span className="font-bold">
                        {booking.total_days}
                      </span>
                    </div>

                    <div className="flex justify-between gap-5">
                      <span>Price / Day</span>

                      <span>
                        RM{" "}
                        {Number(
                          booking.rental_price_per_day || 0
                        ).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-5">
                      <span>Car Rental Amount</span>

                      <span>
                        RM{" "}
                        {Number(
                          booking.car_rental_amount || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {booking.service_type === "Include Driver" && (
                  <div className="flex justify-between gap-5">
                    <span>Driver Charge</span>

                    <span>
                      RM{" "}
                      {Number(
                        booking.driver_charge || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

                {booking.service_type === "Delivery Only" && (
                  <div className="flex justify-between gap-5">
                    <span>Delivery Charge</span>

                    <span>
                      RM{" "}
                      {Number(
                        booking.delivery_charge || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

                <hr />

                <div className="flex justify-between gap-5 text-2xl font-bold text-green-600">
                  <span>Total Amount</span>

                  <span>
                    RM{" "}
                    {Number(
                      booking.total_amount || 0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {booking.payment_status === "Paid" ? (
                <div className="mt-8 w-full bg-green-100 text-green-700 py-4 rounded-xl text-center font-bold border border-green-300">
                  ✓ Payment Completed
                </div>
              ) : (
                <button
                  onClick={() =>
                    navigate(`/payment/${booking.booking_id}`)
                  }
                  className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold"
                >
                  Continue to Payment
                </button>
              )}

              <button
                onClick={() => navigate("/cars")}
                className="mt-4 w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold"
              >
                Back to Cars
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookingSummary;