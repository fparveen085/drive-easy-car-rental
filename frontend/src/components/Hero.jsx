import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const handleBookNow = () => {
    const customer = localStorage.getItem("customer");

    if (!customer) {
      navigate("/login");
      return;
    }

    document
      .getElementById("booking-search")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <section className="bg-gradient-to-r from-slate-950 to-blue-900 text-white px-10 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Find Your Perfect Rental Car
          </h1>

          <p className="text-xl text-gray-200 leading-relaxed mb-8">
            Affordable, safe and reliable car rental services for
            <span className="font-semibold text-white">
              {" "}Self-Drive
            </span>,
            <span className="font-semibold text-white">
              {" "}Driver Included
            </span>,
            and
            <span className="font-semibold text-white">
              {" "}Delivery Only
            </span>.
          </p>

          <button
            onClick={handleBookNow}
            className="bg-green-500 hover:bg-green-600 transition px-8 py-4 rounded-xl text-lg font-bold shadow-lg"
          >
            🚗 Book Now
          </button>
        </div>

        {/* Right Side */}
        <div className="bg-white/10 rounded-3xl p-6 shadow-2xl">

          <img
            src="/home.jpg"
            alt="DriveEasy Rental Cars"
            className="w-full h-80 object-cover rounded-2xl"
          />

          <h2 className="text-3xl font-bold text-center mt-6">
            Best Deals in Malaysia
          </h2>

          <p className="text-center text-gray-200 mt-3">
            Explore a wide range of quality rental cars with affordable prices,
            flexible booking options, and trusted service across Malaysia.
          </p>

        </div>

      </div>
    </section>
  );
}

export default Hero;