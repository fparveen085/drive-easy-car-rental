import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";import Navbar from "../components/Navbar";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents
} from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);

  return null;
}

const reverseGeocode = async (lat, lon, setAddress) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          format: "json",
          lat,
          lon
        }
      }
    );

    setAddress(response.data.display_name);
  } catch (error) {
    console.log(error);
  }
};

function Booking() {
  const navigate = useNavigate();
  const { carId } = useParams();
  const location = useLocation();
  const searchData = location.state;

  const customer = JSON.parse(localStorage.getItem("customer"));
  const [selectedCar, setSelectedCar] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  const [pickupPos, setPickupPos] = useState([3.139, 101.6869]);
  const [dropPos, setDropPos] = useState([3.139, 101.6869]);

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");

  const [serviceType, setServiceType] = useState("");
  const [pickupOption, setPickupOption] = useState("Now");

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [baggageQty, setBaggageQty] = useState(1);
  const [largeBaggage, setLargeBaggage] = useState("No");
  const [specialInstruction, setSpecialInstruction] = useState("");

  const debounceRef = useRef(null);

  const getLocalDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getLocalTime = () => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const today = getLocalDate();

  const isDeliveryOnly = serviceType === "Delivery Only";

  const minReturnDate = pickupDate || today;

  useEffect(() => {
    if (!customer) {
      alert("Please login first");
      navigate("/login");
    }
  }, [customer, navigate]);
  useEffect(() => {
  const loadCustomerProfile = async () => {
    if (!customer?.customer_id) {
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/customer/profile/${customer.customer_id}`
      );

      setCustomerProfile(response.data);
    } catch (error) {
      console.error(
        "Failed to load customer profile:",
        error.response?.data || error.message
      );

      setCustomerProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  loadCustomerProfile();
}, [customer?.customer_id]);
  useEffect(() => {
  const loadCar = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/car/${carId}`
      );

      setSelectedCar(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  loadCar();
}, [carId]);

  useEffect(() => {
    if (pickupOption === "Now") {
      setPickupDate(getLocalDate());
      setPickupTime(getLocalTime());
    }
  }, [pickupOption]);
useEffect(() => {
  if (!searchData) return;

  setPickupLocation(searchData.pickupLocation || "");
  setDropoffLocation(searchData.returnLocation || "");

  setPickupAddress(searchData.pickupLocation || "");
  setDropoffAddress(searchData.returnLocation || "");

  // Move pickup map pin
  if (searchData.pickupCoordinates) {
    setPickupPos([
      Number(searchData.pickupCoordinates.lat),
      Number(searchData.pickupCoordinates.lng),
    ]);
  }

  // Move drop-off map pin
  if (searchData.returnCoordinates) {
    setDropPos([
      Number(searchData.returnCoordinates.lat),
      Number(searchData.returnCoordinates.lng),
    ]);
  }

  setPickupDate(searchData.pickupDate || "");
  setReturnDate(searchData.returnDate || "");

  setPickupTime(searchData.pickupTime || "");
  setServiceType(searchData.serviceType || "");
}, [searchData]);

  const hasValidDrivingLicence = () => {
  if (!customerProfile) {
    return false;
  }

  const hasLicenceNumber =
    customerProfile.license_no &&
    customerProfile.license_no.trim() !== "";

  const hasLicencePhoto =
    customerProfile.license_photo &&
    customerProfile.license_photo.trim() !== "";

  if (
    !hasLicenceNumber ||
    !hasLicencePhoto ||
    !customerProfile.license_validity
  ) {
    return false;
  }

  const expiryDate = new Date(
    customerProfile.license_validity
  );

  const todayDate = new Date();

  expiryDate.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);

  if (Number.isNaN(expiryDate.getTime())) {
    return false;
  }

  return expiryDate >= todayDate;
};

const selectSelfDrive = () => {
  if (profileLoading) {
    alert("Please wait. Your driving licence is being checked.");
    return;
  }

  if (!hasValidDrivingLicence()) {
    const updateProfile = window.confirm(
      "Self Drive requires a valid driving licence number, licence photo and validity date.\n\nDo you want to update your profile now?"
    );

    if (updateProfile) {
      navigate("/profile");
    }

    return;
  }

  setServiceType("Self Drive");
  setPickupOption("Now");
};
  const fetchSuggestions = async (text, setSuggestions) => {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            format: "json",
            q: text,
            limit: 5
          }
        }
      );

      setSuggestions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBooking = async () => {
    if (!serviceType) {
      alert("Please select service type");
      return;
    }
    if (
  serviceType === "Self Drive" &&
  !hasValidDrivingLicence()
) {
  const updateProfile = window.confirm(
    "You cannot book Self Drive because your driving licence information is incomplete or expired.\n\nDo you want to update your profile?"
  );

  if (updateProfile) {
    navigate("/profile");
  }

  return;
}

    if (pickupOption === "Later" && !pickupDate) {
      alert(
        isDeliveryOnly
          ? "Please select delivery date"
          : "Please select pickup date"
      );
      return;
    }

    if (pickupOption === "Later" && !pickupTime) {
      alert(
        isDeliveryOnly
          ? "Please select delivery time"
          : "Please select pickup time"
      );
      return;
    }

    if (!isDeliveryOnly && !returnDate) {
      alert("Please select return date");
      return;
    }

    if (!isDeliveryOnly && returnDate < pickupDate) {
      alert("Return date cannot be before pickup date.");
      return;
    }
    if (isDeliveryOnly && (!baggageQty || Number(baggageQty) < 1)) {
      alert("Please enter the number of baggage.");
      return;
    }
    if (
      isDeliveryOnly &&
      Number(baggageQty) >
        Number(selectedCar?.baggage_capacity || 0)
    ) {
      alert(
        `This vehicle can carry only ${selectedCar?.baggage_capacity} baggage item(s). Please choose another vehicle.`
      );
      return;
    }
    if (!pickupAddress) {
      alert(
        isDeliveryOnly
          ? "Please select pickup or delivery start location"
          : "Please select pickup location"
      );
      return;
    }

    if (!dropoffAddress) {
      alert(
        isDeliveryOnly
          ? "Please select delivery destination"
          : "Please select drop location"
      );
      return;
    }

    const confirmBooking = window.confirm(
      isDeliveryOnly
        ? "Do you want to continue with this delivery booking?"
        : "Do you want to continue with this booking?"
    );

    if (!confirmBooking) {
      return;
    }

    try {
      const bookingData = {
        customer_id: customer.customer_id,
        car_id: carId,
        service_type: serviceType,
        pickup_option: pickupOption,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        return_date: isDeliveryOnly ? pickupDate : returnDate,
        pickup_location: pickupAddress,
        dropoff_location: dropoffAddress,
        baggage_qty: isDeliveryOnly ? Number(baggageQty) : null,
        large_baggage: isDeliveryOnly ? largeBaggage : null,
        special_instruction: isDeliveryOnly
          ? specialInstruction
          : null
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/booking`,
        bookingData
      );

      alert("Booking created successfully");

      navigate(`/booking-summary/${response.data.booking_id}`);
    } catch (error) {
      console.log(error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Booking failed");
      }
    }
  };

  const selectPickup = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setPickupPos([lat, lon]);
    setPickupLocation(place.display_name);
    setPickupAddress(place.display_name);
    setPickupSuggestions([]);
  };

  const selectDropoff = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setDropPos([lat, lon]);
    setDropoffLocation(place.display_name);
    setDropoffAddress(place.display_name);
    setDropSuggestions([]);
  };

  function PickupMarker() {
    useMapEvents({
      click(event) {
        const lat = event.latlng.lat;
        const lon = event.latlng.lng;

        setPickupPos([lat, lon]);

        reverseGeocode(lat, lon, (address) => {
          setPickupAddress(address);
          setPickupLocation(address);
        });
      }
    });

    return (
      <Marker position={pickupPos}>
        <Popup>
          {isDeliveryOnly
            ? "Pickup / Delivery Start"
            : "Pickup Location"}
        </Popup>
      </Marker>
    );
  }

  function DropMarker() {
    useMapEvents({
      click(event) {
        const lat = event.latlng.lat;
        const lon = event.latlng.lng;

        setDropPos([lat, lon]);

        reverseGeocode(lat, lon, (address) => {
          setDropoffAddress(address);
          setDropoffLocation(address);
        });
      }
    });

    return (
      <Marker position={dropPos}>
        <Popup>
          {isDeliveryOnly
            ? "Delivery Destination"
            : "Drop Location"}
        </Popup>
      </Marker>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Car Booking
          </h1>

          <p className="text-gray-500 mb-8">
            Complete your booking details below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STEP 1 */}

            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-center">
                Step 1: Choose Your Service
              </h2>

              <p className="text-center text-gray-500 mt-2 mb-6">
                Select the service that best suits your needs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                {/* SELF DRIVE */}

                <button
                  type="button"
                  onClick={selectSelfDrive}
                  className={`group text-left rounded-3xl border-2 p-8 min-h-[300px]
                    transition-all duration-300 transform
                    hover:-translate-y-2 hover:shadow-2xl ${
                      serviceType === "Self Drive"
                        ? "border-green-600 bg-green-50 shadow-lg"
                        : "border-gray-300 bg-white hover:border-green-400"
                    }`}
                >
                  <div className="text-4xl mb-4">🚗</div>

                  <h3 className="text-xl font-bold">
                    Self Drive
                  </h3>

                  <p className="text-gray-600 mt-3">
                    Rent and drive the vehicle yourself.
                  </p>

                  <p className="text-sm text-gray-500 mt-3">
                    Driving licence is required.
                  </p>

                  <p className="mt-5 font-semibold text-green-700">
                    {serviceType === "Self Drive"
                      ? "✓ Selected"
                      : "Select Service"}
                  </p>
                </button>

                {/* INCLUDE DRIVER */}

                <button
                  type="button"
                  onClick={() => {
                    setServiceType("Include Driver");
                    setPickupOption("Now");
                  }}
                  className={`text-left rounded-3xl border-2 p-8 min-h-[300px]
                    transition-all duration-300 transform
                    hover:-translate-y-2 hover:shadow-2xl ${
                      serviceType === "Include Driver"
                        ? "border-green-600 bg-green-50 shadow-lg"
                        : "border-gray-300 bg-white hover:border-green-400"
                    }`}
                >
                  <div className="text-4xl mb-4">👨‍✈️</div>

                  <h3 className="text-xl font-bold">
                    Include Driver
                  </h3>

                  <p className="text-gray-600 mt-3">
                    Travel with a professional driver.
                  </p>

                  <p className="text-sm text-gray-500 mt-3">
                    Driver will be assigned after payment.
                  </p>

                  <p className="mt-5 font-semibold text-green-700">
                    {serviceType === "Include Driver"
                      ? "✓ Selected"
                      : "Select Service"}
                  </p>
                </button>

                {/* DELIVERY ONLY */}

                <button
                  type="button"
                  onClick={() => {
                    setServiceType("Delivery Only");
                    setReturnDate("");
                    setPickupOption("Later");
                  }}
                  className={`text-left rounded-3xl border-2 p-8 min-h-[300px]
                    transition-all duration-300 transform
                    hover:-translate-y-2 hover:shadow-2xl ${
                      serviceType === "Delivery Only"
                        ? "border-green-600 bg-green-50 shadow-lg"
                        : "border-gray-300 bg-white hover:border-green-400"
                    }`}
                >
                  <div className="text-4xl mb-4">📦</div>

                  <h3 className="text-xl font-bold">
                    Delivery Only
                  </h3>

                  <p className="text-gray-600 mt-3">
                    Transport luggage, parcels or boxes.
                  </p>

                  <p className="text-sm text-gray-500 mt-3">
                    Suitable vehicle will be selected.
                  </p>

                  <p className="mt-5 font-semibold text-green-700">
                    {serviceType === "Delivery Only"
                      ? "✓ Selected"
                      : "Select Service"}
                  </p>
                </button>
              </div>
            </div>

            {/* STEP 2 */}

            <div className="md:col-span-2 mt-6">
              <h2 className="text-2xl font-bold">
                Step 2: Booking Details
              </h2>

              <hr className="mt-3 border-gray-300" />
            </div>

            {/* PICKUP OPTION */}

            <div>
              <label className="font-semibold">
                {isDeliveryOnly
                  ? "Delivery Option"
                  : "Pickup Option"}
              </label>

              <select
                value={pickupOption}
                onChange={(event) =>
                  setPickupOption(event.target.value)
                }
                className="w-full mt-2 border p-3 rounded-lg"
              >
                {isDeliveryOnly ? (
                  <>
                    <option value="Now">
                      Deliver Now
                    </option>

                    <option value="Later">
                      Schedule Delivery
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Now">
                      Pickup Now
                    </option>

                    <option value="Later">
                      Pickup Later
                    </option>
                  </>
                )}
              </select>
            </div>

            {/* PICKUP DATE */}

            <div>
              <label className="font-semibold">
                {isDeliveryOnly
                  ? "Delivery Date"
                  : "Pickup Date"}
              </label>

              <input
                type="date"
                min={today}
                value={pickupDate}
                disabled={pickupOption === "Now"}
                onChange={(event) => {
                  const selectedDate = event.target.value;

                  setPickupDate(selectedDate);

                  if (
                    !isDeliveryOnly &&
                    returnDate &&
                    selectedDate > returnDate
                  ) {
                    setReturnDate("");

                    alert(
                      "Return date must be after pickup date."
                    );
                  }
                }}
                className={`w-full mt-2 border p-3 rounded-lg ${
                  pickupOption === "Now"
                    ? "bg-gray-100 cursor-not-allowed text-gray-600"
                    : "bg-white"
                }`}
              />
            </div>

            {/* PICKUP TIME */}

            <div>
              <label className="font-semibold">
                {isDeliveryOnly
                  ? "Delivery Time"
                  : "Pickup Time"}
              </label>

              <input
                type="time"
                value={pickupTime}
                disabled={pickupOption === "Now"}
                onChange={(event) =>
                  setPickupTime(event.target.value)
                }
                className={`w-full mt-2 border p-3 rounded-lg ${
                  pickupOption === "Now"
                    ? "bg-gray-100 cursor-not-allowed text-gray-600"
                    : "bg-white"
                }`}
              />
            </div>

            {/* RETURN DATE */}

            {!isDeliveryOnly && (
              <div>
                <label className="font-semibold">
                  Return Date
                </label>

                <input
                  type="date"
                  min={minReturnDate}
                  value={returnDate}
                  onChange={(event) => {
                    const selectedReturnDate =
                      event.target.value;

                    if (
                      pickupDate &&
                      selectedReturnDate < pickupDate
                    ) {
                      alert(
                        "Return date cannot be before pickup date."
                      );

                      return;
                    }

                    setReturnDate(selectedReturnDate);
                  }}
                  className="w-full mt-2 border p-3 rounded-lg"
                />
              </div>
            )}
          </div>

          {isDeliveryOnly && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
              Delivery Only is a one-time service. The car
              will not be booked for multiple days.
            </div>
          )}
          {isDeliveryOnly && (
            <div className="mt-6 rounded-xl border border-gray-300 bg-gray-50 p-6">
              <h2 className="text-xl font-bold mb-4">
                Delivery Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-semibold">
                    Number of Baggage
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={baggageQty}
                    onChange={(event) =>
                      setBaggageQty(event.target.value)
                    }
                    className="w-full mt-2 border p-3 rounded-lg"
                  />
                </div>
                <p className="text-sm text-blue-700 mt-2">
                Vehicle Capacity :
                <strong>
                {selectedCar?.baggage_capacity ?? 0} baggage item(s)
                </strong>
                </p>
                <div>
                {Number(baggageQty) >
                Number(selectedCar?.baggage_capacity || 0) && (
                <p className="text-red-600 font-semibold mt-2">
                  ⚠ This vehicle cannot carry the entered baggage.
                </p>
              )}
                  <label className="font-semibold">
                    Large Baggage
                  </label>

                  <select
                    value={largeBaggage}
                    onChange={(event) =>
                      setLargeBaggage(event.target.value)
                    }
                    className="w-full mt-2 border p-3 rounded-lg"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="font-semibold">
                    Special Instructions
                  </label>

                  <textarea
                    rows="4"
                    value={specialInstruction}
                    onChange={(event) =>
                      setSpecialInstruction(event.target.value)
                    }
                    placeholder="Example: Fragile items, handle with care."
                    className="w-full mt-2 border p-3 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
          <hr className="my-8" />

          {/* LOCATION MAPS */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PICKUP LOCATION */}

            <div>
              <h2 className="text-2xl font-bold mb-4">
                {isDeliveryOnly
                  ? "Pickup / Start Location"
                  : "Pickup Location"}
              </h2>

              <input
                value={pickupLocation}
                placeholder={
                  isDeliveryOnly
                    ? "Search pickup/start location"
                    : "Search pickup location"
                }
                onChange={(event) => {
                  const value = event.target.value;

                  setPickupLocation(value);
                  clearTimeout(debounceRef.current);

                  debounceRef.current = setTimeout(() => {
                    if (value.length > 2) {
                      fetchSuggestions(
                        value,
                        setPickupSuggestions
                      );
                    } else {
                      setPickupSuggestions([]);
                    }
                  }, 400);
                }}
                className="w-full border p-3 rounded-lg mb-3"
              />

              {pickupSuggestions.length > 0 && (
                <div className="border rounded-lg overflow-hidden mb-3">
                  {pickupSuggestions.map((place, index) => (
                    <div
                      key={index}
                      onClick={() => selectPickup(place)}
                      className="bg-gray-100 p-3 cursor-pointer border-b last:border-b-0 hover:bg-blue-100"
                    >
                      {place.display_name}
                    </div>
                  ))}
                </div>
              )}

              <MapContainer
                center={pickupPos}
                zoom={13}
                className="h-72 w-full rounded-xl mt-4"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <ChangeView center={pickupPos} />

                <PickupMarker />
              </MapContainer>

              <p className="mt-3 text-sm text-gray-600">
                <b>
                  {isDeliveryOnly ? "Start:" : "Pickup:"}
                </b>{" "}
                {pickupAddress || "No location selected"}
              </p>
            </div>

            {/* DROP-OFF LOCATION */}

            <div>
              <h2 className="text-2xl font-bold mb-4">
                {isDeliveryOnly
                  ? "Delivery Destination"
                  : "Drop Location"}
              </h2>

              <input
                value={dropoffLocation}
                placeholder={
                  isDeliveryOnly
                    ? "Search delivery destination"
                    : "Search drop location"
                }
                onChange={(event) => {
                  const value = event.target.value;

                  setDropoffLocation(value);
                  clearTimeout(debounceRef.current);

                  debounceRef.current = setTimeout(() => {
                    if (value.length > 2) {
                      fetchSuggestions(
                        value,
                        setDropSuggestions
                      );
                    } else {
                      setDropSuggestions([]);
                    }
                  }, 400);
                }}
                className="w-full border p-3 rounded-lg mb-3"
              />

              {dropSuggestions.length > 0 && (
                <div className="border rounded-lg overflow-hidden mb-3">
                  {dropSuggestions.map((place, index) => (
                    <div
                      key={index}
                      onClick={() => selectDropoff(place)}
                      className="bg-gray-100 p-3 cursor-pointer border-b last:border-b-0 hover:bg-blue-100"
                    >
                      {place.display_name}
                    </div>
                  ))}
                </div>
              )}

              <MapContainer
                center={dropPos}
                zoom={13}
                className="h-72 w-full rounded-xl mt-4"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <ChangeView center={dropPos} />

                <DropMarker />
              </MapContainer>

              <p className="mt-3 text-sm text-gray-600">
                <b>
                  {isDeliveryOnly
                    ? "Destination:"
                    : "Drop:"}
                </b>{" "}
                {dropoffAddress || "No location selected"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBooking}
            disabled={
              isDeliveryOnly &&
              Number(baggageQty) >
                Number(selectedCar?.baggage_capacity || 0)
            }
            className={`mt-10 w-full py-4 rounded-xl font-bold text-lg text-white ${
              isDeliveryOnly &&
              Number(baggageQty) >
                Number(selectedCar?.baggage_capacity || 0)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </>
  );
}

export default Booking;