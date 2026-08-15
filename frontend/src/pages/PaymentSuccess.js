import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function PaymentSuccess() {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);

  const payment = JSON.parse(localStorage.getItem("lastPayment"));
  const today = new Date();
  const getSuccessMessage = () => {
    if (booking?.service_type === "Self Drive") {
      return "Your Self Drive booking has been confirmed. You may collect the vehicle at the selected pickup date and time.";
    }

    if (booking?.service_type === "Include Driver") {
      return "Your booking has been confirmed. A driver will be assigned shortly. You will be notified once the driver accepts your booking.";
    }

    if (booking?.service_type === "Delivery Only") {
      return "Your delivery booking has been confirmed. A driver will be assigned shortly to collect and deliver your items.";
    }

    return "Your booking has been confirmed successfully.";
  };

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/booking/${bookingId}`
        );

        console.log("Booking data:", response.data);
        setBooking(response.data);
      } catch (err) {
        console.log("Failed to load booking:", err);
      }
    };

    loadBooking();
  }, [bookingId]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-green-50 flex justify-center items-center px-4">
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl text-center">
          <div className="text-7xl mb-4">✅</div>

          <h1 className="text-4xl font-bold text-green-700">
            Payment Successful
          </h1>

          <p className="text-gray-600 mt-3">
            Thank you for choosing DriveEasy.
          </p>
          <div className="mt-5 rounded-xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-blue-900 font-medium">
            {getSuccessMessage()}
          </p>
        </div>

          <div className="bg-gray-100 rounded-xl mt-8 p-6 text-left space-y-3">
            <div className="flex justify-between">
              <span>Booking Reference</span>

              <span className="font-bold">
                {payment?.booking_reference ||
                  booking?.booking_reference ||
                  `#${bookingId}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Customer</span>

              <span>
                {booking?.customer_name ||
                  booking?.full_name ||
                  payment?.customer_name ||
                  payment?.full_name ||
                  "Not available"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Selected Vehicle</span>

              <span>
                {payment?.vehicle_name ||
                  booking?.vehicle_name ||
                  "Not available"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Payment Method</span>
              <span>{payment?.payment_method}</span>
            </div>

            <div className="flex justify-between">
              <span>Amount Paid</span>

              <span className="font-bold text-green-600">
                RM{" "}
                {Number(
                  payment?.payment_amount || booking?.total_amount || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Payment Status</span>
              <span className="text-green-600 font-bold">PAID</span>
            </div>

            <div className="flex justify-between">
              <span>Booking Status</span>
              <span className="text-blue-600 font-semibold">
                Confirmed
              </span>
            </div>

            <div className="flex justify-between">
              <span>Transaction Date</span>
              <span>{today.toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between">
              <span>Transaction Time</span>
              <span>{today.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => navigate("/cars")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            >
              Book Another Car
            </button>

            <button
              onClick={() => navigate("/")}
              className="bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccess;