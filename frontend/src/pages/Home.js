import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchForm from "../components/SearchForm";
import FeaturedCars from "../components/FeaturedCars";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="bg-gray-100">
      <Navbar />

      <Hero />

      <div id="booking-search">
        <SearchForm />
      </div>

      <section className="px-10 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why Choose DriveEasy?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-100 rounded-2xl">
            <h3 className="text-xl font-bold">No Hidden Fees</h3>

            <p className="text-gray-600 mt-2">
              Transparent rental pricing with no surprise charges.
            </p>
          </div>

          <div className="p-6 bg-gray-100 rounded-2xl">
            <h3 className="text-xl font-bold">Easy Booking</h3>

            <p className="text-gray-600 mt-2">
              Book your car online quickly and safely.
            </p>
          </div>

          <div className="p-6 bg-gray-100 rounded-2xl">
            <h3 className="text-xl font-bold">24/7 Support</h3>

            <p className="text-gray-600 mt-2">
              Our support team is always ready to assist you.
            </p>
          </div>
        </div>
      </section>

      <FeaturedCars />

      <section className="px-10 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">
          Our Services
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-blue-50 p-6 rounded-2xl shadow">
            <div className="text-4xl mb-4">🚗</div>

            <h3 className="text-xl font-bold">
              Self Drive
            </h3>

            <p className="text-gray-600 mt-2">
              Rent a vehicle and enjoy the freedom to drive at your own convenience.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow">
            <div className="text-4xl mb-4">👨‍✈️</div>

            <h3 className="text-xl font-bold">
              Include Driver
            </h3>

            <p className="text-gray-600 mt-2">
              Hire a professional driver for business trips, family travel or special occasions.
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-2xl shadow">
            <div className="text-4xl mb-4">🚚</div>

            <h3 className="text-xl font-bold">
              Delivery Service
            </h3>

            <p className="text-gray-600 mt-2">
              Have your rental vehicle delivered to your preferred location within Kuala Lumpur and Selangor.
            </p>
          </div>

        </div>
      </section>

      <Contact />

      <Footer />
    </div>
  );
}

export default Home;