import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function Payment() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const loadBooking = async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/booking/${bookingId}`);
      setBooking(response.data);
    };

    loadBooking();
  }, [bookingId]);

  const paymentMethods = [
    { id: "tng", name: "Touch 'n Go eWallet", icon: "📱", desc: "Pay using your eWallet" },
    { id: "fpx", name: "FPX Online Banking", icon: "🏦", desc: "Malaysian online banking" },
    { id: "card", name: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard and debit cards" },
    { id: "duitnow", name: "DuitNow QR", icon: "🔳", desc: "Scan and pay using DuitNow QR" }
  ];

  if (!booking) return <h2 className="p-10 text-2xl font-bold">Loading payment...</h2>;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold mb-2">Payment</h1>

          <div className="bg-gray-50 rounded-xl p-5 mb-8">
            <p><b>Booking Reference:</b> {booking.booking_reference}</p>
            <p><b>Car:</b> {booking.vehicle_name}</p>
            <p><b>Customer:</b> {booking.customer_name || booking.full_name}</p>            <p className="text-2xl font-bold text-green-600 mt-3">
              Amount to Pay: RM {booking.total_amount}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => navigate(`/gateway/${method.id}/${bookingId}`)}
                className="text-left border rounded-2xl p-6 hover:border-blue-600 hover:shadow-lg transition bg-gray-50"
              >
                <div className="text-5xl mb-4">{method.icon}</div>
                <h2 className="text-xl font-bold">{method.name}</h2>
                <p className="text-gray-500 mt-2">{method.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Payment;