import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function FeaturedCars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/cars`);

      // Show only the first 4 featured cars
      setCars(res.data.slice(0, 4));
    } catch (err) {
      console.log(err);
    }
  };

  const book = () => {
  const customer = localStorage.getItem("customer");

  if (!customer) {
    navigate("/login");
    return;
  }

  const searchSection = document.getElementById("booking-search");

  if (searchSection) {
    searchSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

  return (
    <section 
      id="search-form"
      className="px-10 py-16 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-10">
        Featured Cars
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {cars.map((car) => (
          <div
            key={car.car_id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
          >
            {car.vehicle_image ? (
              <img
                src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/uploads/${car.vehicle_image}`}
                alt={car.vehicle_name}
                className="w-full h-52 object-cover"
              />
            ) : (
              <div className="h-52 flex items-center justify-center text-7xl bg-gray-200">
                🚗
              </div>
            )}

            <div className="p-6 text-center">
              <h3 className="text-xl font-bold">
                {car.vehicle_name}
              </h3>

              <p className="text-gray-500">
                {car.brand} {car.model}
              </p>

              <p className="font-semibold mt-2">
                RM {car.rental_price_per_day}/day
              </p>

              <button
                onClick={book}
                className="mt-5 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg w-full"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCars;