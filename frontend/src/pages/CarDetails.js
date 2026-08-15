import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchDetails =
    location.state ||
    JSON.parse(
      sessionStorage.getItem("carSearchDetails") || "null"
    );
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

 useEffect(() => {
  const loadCar = async () => {
    try {
      setLoading(true);
      setImageError(false);

      const response = await axios.get(
        `${API_URL}/cars/${id}`
      );

      setCar(response.data);
    } catch (err) {
      console.error(
        "Failed to load car details:",
        err.response?.data || err.message
      );

      alert("Failed to load car details");
      navigate("/cars");
    } finally {
      setLoading(false);
    }
  };

  loadCar();
}, [id, navigate]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const isAvailable =
    String(
      car?.availability_status || ""
    ).toLowerCase() === "available";

  const baggageCapacity = Number(
    car?.baggage_capacity || 0
  );

  const handleBooking = () => {
    if (!isAvailable) {
      alert("This car is currently unavailable");
      return;
    }

     navigate(`/booking/${car.car_id}`, {
    state: searchDetails,
  });
};

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="text-7xl mb-4">
              🚗
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Loading car details...
            </h2>
          </div>
        </div>
      </>
    );
  }

  if (!car) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <h2 className="text-2xl font-bold text-red-600">
              Car not found
            </h2>

            <button
              type="button"
              onClick={() => navigate("/cars")}
              className="mt-6 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl"
            >
              Back to Cars
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Vehicle Image */}

            <div>
              {car.vehicle_image && !imageError ? (
                <img
                  src={`${API_URL}/uploads/${car.vehicle_image}`}
                  alt={car.vehicle_name}
                  onError={() => setImageError(true)}
                  className="w-full h-96 object-cover rounded-2xl shadow"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-2xl shadow flex flex-col items-center justify-center text-gray-500">
                  <div className="text-9xl">
                    🚗
                  </div>

                  <p className="mt-4 text-lg font-semibold">
                    Vehicle image not available
                  </p>
                </div>
              )}
            </div>

            {/* Vehicle Details */}

            <div>
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">
                    {car.vehicle_name}
                  </h1>

                  <p className="text-gray-500 mt-2 text-lg">
                    {car.brand || "-"}

                    {car.model
                      ? ` • ${car.model}`
                      : ""}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {car.availability_status || "Unknown"}
                </span>
              </div>

              {/* Rental Price */}

              <div className="mt-6 bg-green-50 border border-green-200 p-5 rounded-xl">
                <p className="text-gray-600">
                  Rental Price
                </p>

                <p className="text-3xl font-bold text-green-600 mt-1">
                  RM{" "}
                  {formatPrice(
                    car.rental_price_per_day
                  )}

                  <span className="text-base text-gray-600 font-medium">
                    {" "}
                    / day
                  </span>
                </p>
              </div>

              {/* Vehicle Information */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-100 p-4 rounded-xl">
                  <p className="text-gray-500">
                    Plate Number
                  </p>

                  <h3 className="font-bold mt-1">
                    {car.plate_no || "-"}
                  </h3>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl">
                  <p className="text-gray-500">
                    Vehicle Type
                  </p>

                  <h3 className="font-bold mt-1">
                    {car.vehicle_type || "-"}
                  </h3>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl">
                  <p className="text-gray-500">
                    Transmission
                  </p>

                  <h3 className="font-bold mt-1">
                    {car.transmission_type || "-"}
                  </h3>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl">
                  <p className="text-gray-500">
                    Seat Capacity
                  </p>

                  <h3 className="font-bold mt-1">
                    {car.seat_capacity
                      ? `${car.seat_capacity} Seats`
                      : "-"}
                  </h3>
                </div>

                {/* Baggage Capacity */}

                <div className="sm:col-span-2 bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <p className="text-blue-700">
                    Baggage Capacity
                  </p>

                  <h3 className="font-bold mt-1 text-blue-900 text-lg">
                    🧳 {baggageCapacity} baggage item(s)
                  </h3>

                  <p className="text-sm text-gray-600 mt-2">
                    For Delivery Only bookings, the
                    entered baggage quantity must not
                    exceed this vehicle capacity.
                  </p>
                </div>
              </div>

              {/* Rental Includes */}

              <div className="mt-8 bg-blue-50 border border-blue-200 p-5 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-3">
                  Rental Includes
                </h3>

                <ul className="text-gray-700 space-y-2">
                  <li>✔ Air conditioning</li>
                  <li>✔ Basic vehicle insurance</li>
                  <li>
                    ✔ Clean and maintained vehicle
                  </li>
                  <li>✔ 24/7 customer support</li>
                </ul>
              </div>

              {/* Buttons */}

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/cars", {
                      state: searchDetails,
                    })
                  }
                  className="sm:w-1/2 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold"
                >
                  Back to Cars
                </button>

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={!isAvailable}
                  className={`sm:w-1/2 py-3 rounded-xl font-semibold text-white ${
                    isAvailable
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isAvailable
                    ? "Book This Car"
                    : "Currently Unavailable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CarDetails;