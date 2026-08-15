import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchForm() {
  const navigate = useNavigate();

  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");

  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [returnCoordinates, setReturnCoordinates] = useState(null);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [returnSuggestions, setReturnSuggestions] = useState([]);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [serviceType, setServiceType] = useState("Self Drive");

  const [pickupLoading, setPickupLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (pickupDate && returnDate && returnDate < pickupDate) {
      setReturnDate("");
    }
  }, [pickupDate, returnDate]);

  useEffect(() => {
    if (pickupLocation.trim().length < 3) {
      setPickupSuggestions([]);
      setPickupLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setPickupLoading(true);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=my&q=${encodeURIComponent(
            pickupLocation
          )}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to search pickup locations");
        }

        const data = await response.json();
        setPickupSuggestions(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setPickupSuggestions([]);
        }
      } finally {
        setPickupLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [pickupLocation]);

  useEffect(() => {
    if (returnLocation.trim().length < 3) {
      setReturnSuggestions([]);
      setReturnLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setReturnLoading(true);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=my&q=${encodeURIComponent(
            returnLocation
          )}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to search return locations");
        }

        const data = await response.json();
        setReturnSuggestions(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setReturnSuggestions([]);
        }
      } finally {
        setReturnLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [returnLocation]);

  const selectPickupLocation = (location) => {
    setPickupLocation(location.display_name);

    setPickupCoordinates({
      lat: Number(location.lat),
      lng: Number(location.lon),
    });

    setPickupSuggestions([]);
  };

  const selectReturnLocation = (location) => {
    setReturnLocation(location.display_name);

    setReturnCoordinates({
      lat: Number(location.lat),
      lng: Number(location.lon),
    });

    setReturnSuggestions([]);
  };

  const searchCars = () => {
    if (
      !pickupLocation ||
      !returnLocation ||
      !pickupDate ||
      !returnDate
    ) {
      alert("Please complete all pickup and return information.");
      return;
    }

    if (!pickupCoordinates) {
      alert("Please select a pickup location from the suggestions.");
      return;
    }

    if (!returnCoordinates) {
      alert("Please select a return location from the suggestions.");
      return;
    }

    if (returnDate < pickupDate) {
      alert("Return date cannot be before the pickup date.");
      return;
    }

    const searchDetails = {
      pickupLocation,
      returnLocation,
      pickupCoordinates,
      returnCoordinates,
      pickupDate,
      returnDate,
      serviceType,
    };

    const customer = localStorage.getItem("customer");

    if (customer) {
      navigate("/cars", {
        state: searchDetails,
      });
    } else {
      sessionStorage.setItem(
        "pendingCarSearch",
        JSON.stringify(searchDetails)
      );

      navigate("/login");
    }
  };

  return (
    <section className="relative z-10 px-4 md:px-8 -mt-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-5 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

          {/* Pickup Location */}
          <div className="relative lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pickup Location
            </label>

            <input
              type="text"
              value={pickupLocation}
              onChange={(event) => {
                setPickupLocation(event.target.value);
                setPickupCoordinates(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter pickup location"
              autoComplete="off"
            />

            {pickupLoading && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-lg p-2 shadow-lg z-50 text-sm">
                Searching...
              </div>
            )}

            {!pickupLoading && pickupSuggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                {pickupSuggestions.map((location) => (
                  <button
                    type="button"
                    key={location.place_id}
                    onClick={() => selectPickupLocation(location)}
                    className="block w-full text-left p-2.5 text-sm border-b last:border-b-0 hover:bg-gray-100"
                  >
                    {location.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Return Location */}
          <div className="relative lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Return Location
            </label>

            <input
              type="text"
              value={returnLocation}
              onChange={(event) => {
                setReturnLocation(event.target.value);
                setReturnCoordinates(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter return location"
              autoComplete="off"
            />

            {returnLoading && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-lg p-2 shadow-lg z-50 text-sm">
                Searching...
              </div>
            )}

            {!returnLoading && returnSuggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                {returnSuggestions.map((location) => (
                  <button
                    type="button"
                    key={location.place_id}
                    onClick={() => selectReturnLocation(location)}
                    className="block w-full text-left p-2.5 text-sm border-b last:border-b-0 hover:bg-gray-100"
                  >
                    {location.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Type */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Service Type
            </label>

            <select
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Self Drive">Self Drive</option>
              <option value="Include Driver">Include Driver</option>
              <option value="Delivery Only">Delivery Only</option>
            </select>
          </div>

          {/* Pickup Date */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pickup Date
            </label>

            <input
              type="date"
              value={pickupDate}
              min={today}
              onChange={(event) => setPickupDate(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Return Date */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Return Date
            </label>

            <input
              type="date"
              value={returnDate}
              min={pickupDate || today}
              disabled={!pickupDate}
              onChange={(event) => setReturnDate(event.target.value)}
              className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                !pickupDate
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-white"
              }`}
            />
          </div>

          {/* Search Button */}
          <div className="lg:col-span-2 flex items-end">
            <button
              type="button"
              onClick={searchCars}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition"
            >
              Search Cars
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchForm;