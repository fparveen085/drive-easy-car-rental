import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function FakeGateway() {
  const { method, bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const paymentTitle = () => {
    if (method === "card") return "Credit / Debit Card";
    if (method === "fpx") return "FPX Online Banking";
    if (method === "tng") return "Touch 'n Go eWallet";
    if (method === "duitnow") return "DuitNow QR";
    return "Payment";
  };

  const payNow = async () => {
    try {
      setLoading(true);

      const bookingResponse = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/booking/${bookingId}`
      );

      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/payment`, {
        booking_id: bookingId,
        payment_method: paymentTitle(),
        payment_amount: bookingResponse.data.total_amount,
      });

      localStorage.setItem(
        "lastPayment",
        JSON.stringify({
          bookingId,
          booking_reference: bookingResponse.data.booking_reference,
          customer_name:
            bookingResponse.data.customer_name ||
            bookingResponse.data.full_name,
          vehicle_name: bookingResponse.data.vehicle_name,
          payment_method: paymentTitle(),
          payment_amount: bookingResponse.data.total_amount,
        })
      );

      navigate(`/payment-success/${bookingId}`);
    } catch (err) {
      console.log(err);
      alert("Payment failed");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-2">
            Secure Payment
          </h1>

          <div className="bg-blue-50 p-4 rounded-xl mb-6">
            <h2 className="text-xl font-bold text-blue-700">
              {paymentTitle()}
            </h2>
          </div>

          {method === "card" && (
            <div className="space-y-4">
              <input
                className="w-full border p-3 rounded-lg"
                placeholder="Card Number"
              />

              <input
                className="w-full border p-3 rounded-lg"
                placeholder="Expiry Date"
              />

              <input
                className="w-full border p-3 rounded-lg"
                placeholder="CVV"
              />
            </div>
          )}

          {method === "fpx" && (
            <select className="w-full border p-3 rounded-lg">
              <option>Maybank2u</option>
              <option>CIMB Clicks</option>
              <option>Public Bank</option>
              <option>RHB Bank</option>
              <option>Hong Leong Bank</option>
            </select>
          )}

          {method === "tng" && (
            <input
              className="w-full border p-3 rounded-lg"
              placeholder="Phone Number"
            />
          )}

          {method === "duitnow" && (
            <div className="text-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=DriveEasyPayment"
                alt="QR"
                className="mx-auto"
              />

              <p className="mt-4 text-gray-500">
                Scan this QR using your banking app.
              </p>
            </div>
          )}

          <button
            onClick={payNow}
            disabled={loading}
            className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold"
          >
            {loading ? "Processing Payment..." : "Pay Now"}
          </button>
        </div>
      </div>
    </>
  );
}

export default FakeGateway;