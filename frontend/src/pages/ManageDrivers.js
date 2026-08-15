import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const emptyForm = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  nric_no: "",
  license_no: "",
  license_validity: "",
  driver_fee_per_day: "",
  delivery_fee: "",
  status: "Available",
  driver_photo: "",
  license_photo: ""
};

function ManageDrivers() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingDriverId, setEditingDriverId] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [driverPhotoFile, setDriverPhotoFile] =
    useState(null);

  const [licensePhotoFile, setLicensePhotoFile] =
    useState(null);

  const [driverPhotoPreview, setDriverPhotoPreview] =
    useState("");

  const [licensePhotoPreview, setLicensePhotoPreview] =
    useState("");

  useEffect(() => {
    const admin = JSON.parse(
      localStorage.getItem("admin")
    );

    if (!admin) {
      alert("Please login as admin");
      navigate("/admin/login");
      return;
    }

    const loadDrivers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/drivers`
        );

        setDrivers(response.data);
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data?.message ||
            "Failed to load drivers"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDrivers();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const validateImage = (file) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only JPG, PNG and WEBP images are allowed"
      );

      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be below 5MB");
      return false;
    }

    return true;
  };

  const handleDriverPhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file || !validateImage(file)) {
      event.target.value = "";
      return;
    }

    setDriverPhotoFile(file);
    setDriverPhotoPreview(
      URL.createObjectURL(file)
    );
  };

  const handleLicensePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file || !validateImage(file)) {
      event.target.value = "";
      return;
    }

    setLicensePhotoFile(file);
    setLicensePhotoPreview(
      URL.createObjectURL(file)
    );
  };

  const uploadImage = async (
    file,
    uploadEndpoint
  ) => {
    if (!file) {
      return null;
    }

    const formData = new FormData();

    formData.append("image", file);

    const response = await axios.post(
      `${API_URL}${uploadEndpoint}`,
      formData
    );

    return response.data.filename;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingDriverId(null);

    setDriverPhotoFile(null);
    setLicensePhotoFile(null);

    setDriverPhotoPreview("");
    setLicensePhotoPreview("");
  };

  const handleSubmit = async () => {
    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.license_no.trim()
    ) {
      alert(
        "Full name, email and licence number are required"
      );
      return;
    }

    if (!editingDriverId && !form.password) {
      alert(
        "Password is required for a new driver"
      );
      return;
    }

    const driverFee = Number(
      form.driver_fee_per_day || 0
    );

    const deliveryFee = Number(
      form.delivery_fee || 0
    );

    if (driverFee < 0 || deliveryFee < 0) {
      alert("Driver fees cannot be negative");
      return;
    }

    try {
      setSaving(true);

      let driverPhoto = form.driver_photo;
      let licensePhoto = form.license_photo;

      if (driverPhotoFile) {
        driverPhoto = await uploadImage(
          driverPhotoFile,
          "/admin/upload-driver-photo"
        );
      }

      if (licensePhotoFile) {
        licensePhoto = await uploadImage(
          licensePhotoFile,
          "/admin/upload-license-photo"
        );
      }

      const driverData = {
        full_name: form.full_name.trim(),
        email: form.email
          .trim()
          .toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
        nric_no: form.nric_no.trim(),
        license_no: form.license_no
          .trim()
          .toUpperCase(),
        license_validity:
          form.license_validity || null,
        driver_fee_per_day: driverFee,
        delivery_fee: deliveryFee,
        status: form.status,
        driver_photo: driverPhoto || null,
        license_photo: licensePhoto || null
      };

      if (editingDriverId) {
        const response = await axios.put(
          `${API_URL}/admin/drivers/${editingDriverId}`,
          driverData
        );

        setDrivers((currentDrivers) =>
          currentDrivers.map((driver) =>
            driver.driver_id === editingDriverId
              ? response.data.driver
              : driver
          )
        );

        alert("Driver updated successfully");
      } else {
        const response = await axios.post(
          `${API_URL}/admin/drivers`,
          driverData
        );

        setDrivers((currentDrivers) => [
          response.data.driver,
          ...currentDrivers
        ]);

        alert("Driver added successfully");
      }

      resetForm();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to save driver"
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (driver) => {
    setEditingDriverId(driver.driver_id);

    setForm({
      full_name: driver.full_name || "",
      email: driver.email || "",
      password: "",
      phone: driver.phone || "",
      address: driver.address || "",
      nric_no: driver.nric_no || "",
      license_no: driver.license_no || "",
      license_validity:
        driver.license_validity
          ? driver.license_validity.split("T")[0]
          : "",
      driver_fee_per_day:
        driver.driver_fee_per_day || "",
      delivery_fee: driver.delivery_fee || "",
      status: driver.status || "Available",
      driver_photo:
        driver.driver_photo || "",
      license_photo:
        driver.license_photo || ""
    });

    setDriverPhotoFile(null);
    setLicensePhotoFile(null);

    setDriverPhotoPreview(
      driver.driver_photo
        ? `${API_URL}/uploads/${driver.driver_photo}`
        : ""
    );

    setLicensePhotoPreview(
      driver.license_photo
        ? `${API_URL}/uploads/${driver.license_photo}`
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteDriver = async (driverId) => {
    const confirmed = window.confirm(
      "Delete this driver permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/drivers/${driverId}`
      );

      setDrivers((currentDrivers) =>
        currentDrivers.filter(
          (driver) =>
            driver.driver_id !== driverId
        )
      );

      if (editingDriverId === driverId) {
        resetForm();
      }

      alert("Driver deleted successfully");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete driver"
      );
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-MY",
      {
        style: "currency",
        currency: "MYR"
      }
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-MY",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const statusStyle = (status) => {
    if (status === "Available") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Busy") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  const filteredDrivers = drivers.filter(
    (driver) => {
      const keyword = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        driver.full_name
          ?.toLowerCase()
          .includes(keyword) ||
        driver.email
          ?.toLowerCase()
          .includes(keyword) ||
        driver.phone
          ?.toLowerCase()
          .includes(keyword) ||
        driver.license_no
          ?.toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        driver.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-bold">
          Loading Drivers...
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
            Manage Drivers
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/dashboard")
          }
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
        >
          Back to Dashboard
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section className="bg-white rounded-2xl shadow p-7">
          <h2 className="text-3xl font-bold">
            {editingDriverId
              ? "Edit Driver"
              : "Add New Driver"}
          </h2>

          <p className="text-gray-500 mt-1 mb-7">
            Enter the driver information below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block font-semibold mb-2">
                Full Name *
              </label>

              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Password{" "}
                {!editingDriverId && "*"}
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  editingDriverId
                    ? "Leave empty to keep password"
                    : "Enter password"
                }
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                NRIC Number
              </label>

              <input
                name="nric_no"
                value={form.nric_no}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Licence Number *
              </label>

              <input
                name="license_no"
                value={form.license_no}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Licence Expiry
              </label>

              <input
                type="date"
                name="license_validity"
                value={form.license_validity}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Driver Fee Per Day
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="driver_fee_per_day"
                value={form.driver_fee_per_day}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Delivery Fee
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="delivery_fee"
                value={form.delivery_fee}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="Available">
                  Available
                </option>

                <option value="Busy">
                  Busy
                </option>

                <option value="Off Duty">
                  Off Duty
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold mb-2">
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Driver Photo
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleDriverPhotoChange}
                className="w-full border rounded-xl px-4 py-3"
              />

              {driverPhotoPreview && (
                <img
                  src={driverPhotoPreview}
                  alt="Driver preview"
                  className="w-full h-40 object-cover rounded-xl mt-3"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Driving Licence Photo
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLicensePhotoChange}
                className="w-full border rounded-xl px-4 py-3"
              />

              {licensePhotoPreview && (
                <img
                  src={licensePhotoPreview}
                  alt="Licence preview"
                  className="w-full h-40 object-cover rounded-xl mt-3"
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-7">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-xl font-semibold"
            >
              {saving
                ? "Saving..."
                : editingDriverId
                  ? "Update Driver"
                  : "Add Driver"}
            </button>

            {editingDriverId && (
              <button
                onClick={resetForm}
                className="bg-gray-700 hover:bg-gray-800 text-white px-7 py-3 rounded-xl font-semibold"
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
                Driver List
              </h2>

              <p className="text-gray-500">
                Total drivers: {drivers.length}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search driver"
                className="w-full md:w-72 border rounded-xl px-4 py-3 bg-white"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full md:w-48 border rounded-xl px-4 py-3 bg-white"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Available">
                  Available
                </option>

                <option value="Busy">
                  Busy
                </option>

                <option value="Off Duty">
                  Off Duty
                </option>
              </select>
            </div>
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <h3 className="text-xl font-bold">
                No drivers found
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.driver_id}
                  className="bg-white rounded-2xl shadow overflow-hidden"
                >
                  {driver.driver_photo ? (
                    <img
                      src={`${API_URL}/uploads/${driver.driver_photo}`}
                      alt={driver.full_name}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-7xl">
                      👤
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-bold">
                          {driver.full_name}
                        </h3>

                        <p className="text-gray-500">
                          {driver.email}
                        </p>
                      </div>

                      <span
                        className={`h-fit px-3 py-1 rounded-full text-sm font-semibold ${statusStyle(
                          driver.status
                        )}`}
                      >
                        {driver.status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      <p>
                        <b>Phone:</b>{" "}
                        {driver.phone || "-"}
                      </p>

                      <p>
                        <b>Licence:</b>{" "}
                        {driver.license_no}
                      </p>

                      <p>
                        <b>Licence Expiry:</b>{" "}
                        {formatDate(
                          driver.license_validity
                        )}
                      </p>

                      <p>
                        <b>Driver Fee:</b>{" "}
                        {formatCurrency(
                          driver.driver_fee_per_day
                        )}{" "}
                        / day
                      </p>

                      <p>
                        <b>Delivery Fee:</b>{" "}
                        {formatCurrency(
                          driver.delivery_fee
                        )}
                      </p>
                    </div>

                    {driver.license_photo && (
                      <a
                        href={`${API_URL}/uploads/${driver.license_photo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-5 text-center bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold"
                      >
                        View Driving Licence
                      </a>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() =>
                          startEdit(driver)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteDriver(
                            driver.driver_id
                          )
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

export default ManageDrivers;