import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate,useLocation,} from "react-router-dom"; 
import Navbar from "../components/Navbar";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Cars() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchDetails =
    location.state ||
    JSON.parse(
      sessionStorage.getItem("carSearchDetails") || "null"
    );
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [customer] = useState(() => {
    try {
      const storedCustomer = localStorage.getItem("customer");

      return storedCustomer
        ? JSON.parse(storedCustomer)
        : null;
    } catch (error) {
      console.error("Invalid customer data:", error);
      return null;
    }
  });

  useEffect(() => {
    if (!customer || !customer.customer_id) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    loadCars();
  }, [customer, navigate]);

  const loadCars = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(`${API_URL}/cars`);

      setCars(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Load cars error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load cars"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer");
    navigate("/");
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-MY",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  };

  const getAvailabilityStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "available") {
      return "bg-green-100 text-green-700";
    }

    if (
      value === "rented" ||
      value === "unavailable"
    ) {
      return "bg-red-100 text-red-700";
    }

    if (value === "maintenance") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  if (!customer) {
    return null;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Available Cars
          </h1>

          <p className="mt-3 text-lg">
            Welcome,{" "}
            <span className="font-bold">
              {customer.full_name}
            </span>
          </p>

          <p className="mt-2 text-gray-200">
            Choose the right vehicle for your journey.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={loadCars}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
            >
              Refresh Cars
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {errorMessage && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-8">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl shadow p-12 text-center">
              <div className="text-6xl mb-4">
                🚗
              </div>

              <h2 className="text-2xl font-bold">
                Loading cars...
              </h2>
            </div>
          ) : cars.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-12 text-center">
              <div className="text-6xl mb-4">
                🚘
              </div>

              <h2 className="text-2xl font-bold">
                No cars available
              </h2>

              <p className="text-gray-500 mt-2">
                Please check again later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => {
                const isAvailable =
                  String(
                    car.availability_status || ""
                  ).toLowerCase() === "available";

                return (
                  <div
                    key={car.car_id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300"
                  >
                    {/* Vehicle Image */}
                    {car.vehicle_image ? (
                      <img
                        src={`${API_URL}/uploads/${car.vehicle_image}`}
                        alt={car.vehicle_name}
                        className="w-full h-60 object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";

                          const fallback =
                            event.currentTarget
                              .nextElementSibling;

                          if (fallback) {
                            fallback.style.display =
                              "flex";
                          }
                        }}
                      />
                    ) : null}

                    <div
                      className="w-full h-60 bg-gray-200 items-center justify-center text-7xl"
                      style={{
                        display: car.vehicle_image
                          ? "none"
                          : "flex"
                      }}
                    >
                      🚗
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800">
                            {car.vehicle_name}
                          </h2>

                          <p className="text-gray-500 mt-1">
                            {car.brand || "-"}{" "}
                            {car.model || ""}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getAvailabilityStyle(
                            car.availability_status
                          )}`}
                        >
                          {car.availability_status ||
                            "Unknown"}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3 text-gray-700">
                        <p>
                          🚘 Plate Number:{" "}
                          <span className="font-semibold">
                            {car.plate_no || "-"}
                          </span>
                        </p>

                        <p>
                          👥 Seats:{" "}
                          <span className="font-semibold">
                            {car.seat_capacity || "-"}
                          </span>
                        </p>

                        {car.transmission && (
                          <p>
                            ⚙️ Transmission:{" "}
                            <span className="font-semibold">
                              {car.transmission}
                            </span>
                          </p>
                        )}

                        {car.fuel_type && (
                          <p>
                            ⛽ Fuel:{" "}
                            <span className="font-semibold">
                              {car.fuel_type}
                            </span>
                          </p>
                        )}

                        <p className="text-2xl font-bold text-green-600 pt-2">
                          RM{" "}
                          {formatPrice(
                            car.rental_price_per_day
                          )}
                          /day
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!isAvailable}
                         onClick={() => {
                          navigate(`/car/${car.car_id}`, {
                            state: searchDetails,
                          });
                        }}
                        className={`mt-6 w-full py-3 rounded-lg font-semibold text-white ${
                          isAvailable
                            ? "bg-blue-700 hover:bg-blue-800"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {isAvailable
                          ? "More Details"
                          : "Currently Unavailable"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Cars;