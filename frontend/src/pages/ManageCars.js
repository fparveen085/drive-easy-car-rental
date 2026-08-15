import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const emptyForm = {
  vehicle_name: "",
  brand: "",
  model: "",
  plate_no: "",
  transmission_type: "Automatic",
  seat_capacity: "",
  rental_price_per_day: "",
  availability_status: "Available",
  vehicle_image: ""
};

function ManageCars() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCarId, setEditingCarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));

    if (!admin) {
      alert("Please login as admin");
      navigate("/admin/login");
      return;
    }

    const loadCars = async () => {
      try {
        const response = await axios.get(`${API_URL}/cars`);
        setCars(response.data);
      } catch (error) {
        console.log(error);
        alert("Failed to load cars");
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const resetForm = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setForm(emptyForm);
    setEditingCarId(null);
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be below 5MB");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      return form.vehicle_image || null;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await axios.post(
        `${API_URL}/admin/upload-car-image`,
        formData
      );

      return response.data.filename;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.vehicle_name.trim() ||
      !form.brand.trim() ||
      !form.model.trim() ||
      !form.plate_no.trim() ||
      !form.seat_capacity ||
      !form.rental_price_per_day
    ) {
      alert("Please complete all required fields");
      return;
    }

    const seats = Number(form.seat_capacity);
    const price = Number(form.rental_price_per_day);

    if (!Number.isInteger(seats) || seats < 1) {
      alert("Seat capacity must be at least 1");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert("Rental price must be greater than 0");
      return;
    }

    try {
      setSaving(true);

      const uploadedFilename = await uploadImage();

      const carData = {
        ...form,
        vehicle_name: form.vehicle_name.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        plate_no: form.plate_no.trim().toUpperCase(),
        seat_capacity: seats,
        rental_price_per_day: price,
        vehicle_image: uploadedFilename
      };

      if (editingCarId) {
        const response = await axios.put(
          `${API_URL}/admin/cars/${editingCarId}`,
          carData
        );

        setCars((currentCars) =>
          currentCars.map((car) =>
            car.car_id === editingCarId
              ? response.data.car
              : car
          )
        );

        alert("Car updated successfully");
      } else {
        const response = await axios.post(
          `${API_URL}/admin/cars`,
          carData
        );

        setCars((currentCars) => [
          response.data.car,
          ...currentCars
        ]);

        alert("Car added successfully");
      }

      resetForm();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to save car"
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (car) => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditingCarId(car.car_id);

    setForm({
      vehicle_name: car.vehicle_name || "",
      brand: car.brand || "",
      model: car.model || "",
      plate_no: car.plate_no || "",
      transmission_type:
        car.transmission_type || "Automatic",
      seat_capacity: car.seat_capacity || "",
      rental_price_per_day:
        car.rental_price_per_day || "",
      availability_status:
        car.availability_status || "Available",
      vehicle_image: car.vehicle_image || ""
    });

    setSelectedImage(null);

    setImagePreview(
      car.vehicle_image
        ? `${API_URL}/uploads/${car.vehicle_image}`
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteCar = async (carId) => {
    const confirmed = window.confirm(
      "Delete this car permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/cars/${carId}`
      );

      setCars((currentCars) =>
        currentCars.filter(
          (car) => car.car_id !== carId
        )
      );

      if (editingCarId === carId) {
        resetForm();
      }

      alert("Car deleted successfully");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete car"
      );
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-MY", {
      style: "currency",
      currency: "MYR"
    });
  };

  const filteredCars = cars.filter((car) => {
    const keyword = search.trim().toLowerCase();

    return (
      car.vehicle_name?.toLowerCase().includes(keyword) ||
      car.brand?.toLowerCase().includes(keyword) ||
      car.model?.toLowerCase().includes(keyword) ||
      car.plate_no?.toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-bold">
          Loading Cars...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-950 text-white px-8 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            DriveEasy Admin
          </h1>

          <p className="text-sm text-gray-300">
            Manage Cars
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
        >
          Back to Dashboard
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section className="bg-white rounded-2xl shadow p-7">
          <div className="mb-6">
            <h2 className="text-3xl font-bold">
              {editingCarId ? "Edit Car" : "Add New Car"}
            </h2>

            <p className="text-gray-500 mt-1">
              Enter the vehicle information below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block font-semibold mb-2">
                Vehicle Name *
              </label>

              <input
                name="vehicle_name"
                value={form.vehicle_name}
                onChange={handleChange}
                placeholder="Toyota Vios"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Brand *
              </label>

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Toyota"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Model *
              </label>

              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Vios 1.5G"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Plate Number *
              </label>

              <input
                name="plate_no"
                value={form.plate_no}
                onChange={handleChange}
                placeholder="JQA 1234"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Transmission *
              </label>

              <select
                name="transmission_type"
                value={form.transmission_type}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="Automatic">
                  Automatic
                </option>

                <option value="Manual">
                  Manual
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Seat Capacity *
              </label>

              <input
                type="number"
                min="1"
                name="seat_capacity"
                value={form.seat_capacity}
                onChange={handleChange}
                placeholder="5"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Rental Price Per Day (RM) *
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                name="rental_price_per_day"
                value={form.rental_price_per_day}
                onChange={handleChange}
                placeholder="120.00"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Availability
              </label>

              <select
                name="availability_status"
                value={form.availability_status}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="Available">
                  Available
                </option>

                <option value="Unavailable">
                  Unavailable
                </option>

                <option value="Maintenance">
                  Maintenance
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Car Image
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="w-full border rounded-xl px-4 py-3 bg-white"
              />

              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG or WEBP. Maximum size 5MB.
              </p>

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Car preview"
                    className="w-full h-40 object-cover rounded-xl border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-7">
            <button
              onClick={handleSubmit}
              disabled={saving || uploadingImage}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-xl font-semibold"
            >
              {saving || uploadingImage
                ? "Saving..."
                : editingCarId
                  ? "Update Car"
                  : "Add Car"}
            </button>

            {editingCarId && (
              <button
                onClick={resetForm}
                disabled={saving || uploadingImage}
                className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white px-7 py-3 rounded-xl font-semibold"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold">
                Vehicle List
              </h2>

              <p className="text-gray-500">
                Total cars: {cars.length}
              </p>
            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search car or plate number"
              className="w-full md:w-80 border rounded-xl px-4 py-3 bg-white"
            />
          </div>

          {filteredCars.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <h3 className="text-xl font-bold">
                No cars found
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <div
                  key={car.car_id}
                  className="bg-white rounded-2xl shadow overflow-hidden"
                >
                  {car.vehicle_image ? (
                    <img
                      src={`${API_URL}/uploads/${car.vehicle_image}`}
                      alt={car.vehicle_name}
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="w-full h-52 bg-gray-200 flex items-center justify-center text-7xl">
                      🚗
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-2xl font-bold">
                          {car.vehicle_name}
                        </h3>

                        <p className="text-gray-500">
                          {car.brand} {car.model}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          car.availability_status === "Available"
                            ? "bg-green-100 text-green-700"
                            : car.availability_status === "Maintenance"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {car.availability_status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-gray-700">
                      <p>
                        <b>Plate:</b> {car.plate_no}
                      </p>

                      <p>
                        <b>Transmission:</b>{" "}
                        {car.transmission_type}
                      </p>

                      <p>
                        <b>Seats:</b> {car.seat_capacity}
                      </p>

                      <p className="text-xl font-bold text-green-700">
                        {formatCurrency(
                          car.rental_price_per_day
                        )}{" "}
                        / day
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        onClick={() => startEdit(car)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteCar(car.car_id)
                        }
                        className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManageCars;