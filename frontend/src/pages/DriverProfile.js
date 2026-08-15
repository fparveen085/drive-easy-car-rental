import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function DriverProfile() {
  const navigate = useNavigate();

  const [driverLogin] = useState(() => {
    try {
      const storedDriver = localStorage.getItem("driver");

      return storedDriver
        ? JSON.parse(storedDriver)
        : null;
    } catch (error) {
      console.error("Invalid driver login data:", error);
      return null;
    }
  });

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    emergency_contact: ""
  });

  const [driverPhoto, setDriverPhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);

  const [driverPhotoPreview, setDriverPhotoPreview] =
    useState("");

  const [licensePhotoPreview, setLicensePhotoPreview] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingDriverPhoto, setUploadingDriverPhoto] =
    useState(false);

  const [uploadingLicensePhoto, setUploadingLicensePhoto] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!driverLogin || !driverLogin.driver_id) {
      localStorage.removeItem("driver");
      navigate("/driver/login");
      return;
    }

    loadProfile();
  // The loader intentionally runs only when the stored driver changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverLogin, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
        `${API_URL}/driver/profile/${driverLogin.driver_id}`
      );

      setProfile(response.data);

      setFormData({
        phone: response.data.phone || "",
        address: response.data.address || "",
        emergency_contact:
          response.data.emergency_contact || ""
      });
    } catch (error) {
      console.error(
        "Load driver profile error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load driver profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!formData.phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (!formData.address.trim()) {
      alert("Please enter your address");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(
        `${API_URL}/driver/profile/${driverLogin.driver_id}`,
        {
          phone: formData.phone,
          address: formData.address,
          emergency_contact:
            formData.emergency_contact
        }
      );

      setProfile((currentProfile) => ({
        ...currentProfile,
        ...response.data.driver
      }));

      const updatedLoginData = {
        ...driverLogin,
        phone: response.data.driver.phone,
        address: response.data.driver.address
      };

      localStorage.setItem(
        "driver",
        JSON.stringify(updatedLoginData)
      );

      alert(response.data.message);
    } catch (error) {
      console.error(
        "Update profile error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDriverPhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      event.target.value = "";
      return;
    }

    setDriverPhoto(file);
    setDriverPhotoPreview(URL.createObjectURL(file));
  };

  const handleLicensePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      event.target.value = "";
      return;
    }

    setLicensePhoto(file);
    setLicensePhotoPreview(URL.createObjectURL(file));
  };

  const uploadDriverPhoto = async () => {
    if (!driverPhoto) {
      alert("Please select a driver photo");
      return;
    }

    try {
      setUploadingDriverPhoto(true);

      const uploadData = new FormData();
      uploadData.append("driver_photo", driverPhoto);

      const response = await axios.put(
        `${API_URL}/driver/profile/${driverLogin.driver_id}/photo`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setProfile((currentProfile) => ({
        ...currentProfile,
        driver_photo: response.data.driver_photo
      }));

      const updatedLoginData = {
        ...driverLogin,
        driver_photo: response.data.driver_photo
      };

      localStorage.setItem(
        "driver",
        JSON.stringify(updatedLoginData)
      );

      setDriverPhoto(null);
      setDriverPhotoPreview("");

      alert(response.data.message);
    } catch (error) {
      console.error(
        "Upload driver photo error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to upload driver photo"
      );
    } finally {
      setUploadingDriverPhoto(false);
    }
  };

  const uploadLicensePhoto = async () => {
    if (!licensePhoto) {
      alert("Please select a licence photo");
      return;
    }

    try {
      setUploadingLicensePhoto(true);

      const uploadData = new FormData();
      uploadData.append("license_photo", licensePhoto);

      const response = await axios.put(
        `${API_URL}/driver/profile/${driverLogin.driver_id}/license-photo`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setProfile((currentProfile) => ({
        ...currentProfile,
        license_photo: response.data.license_photo
      }));

      setLicensePhoto(null);
      setLicensePhotoPreview("");

      alert(response.data.message);
    } catch (error) {
      console.error(
        "Upload licence photo error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to upload licence photo"
      );
    } finally {
      setUploadingLicensePhoto(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("driver");
    navigate("/driver/login");
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-MY", {
      style: "currency",
      currency: "MYR"
    });
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const licenseStatus = () => {
    if (!profile?.license_validity) {
      return {
        label: "No expiry date",
        style: "bg-gray-100 text-gray-700"
      };
    }

    const today = new Date();
    const expiryDate = new Date(profile.license_validity);

    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      return {
        label: "Expired",
        style: "bg-red-100 text-red-700"
      };
    }

    const remainingDays = Math.ceil(
      (expiryDate - today) / (1000 * 60 * 60 * 24)
    );

    if (remainingDays <= 30) {
      return {
        label: "Expiring Soon",
        style: "bg-yellow-100 text-yellow-700"
      };
    }

    return {
      label: "Valid",
      style: "bg-green-100 text-green-700"
    };
  };

  if (!driverLogin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>

          <h2 className="text-2xl font-bold">
            Loading Driver Profile...
          </h2>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-3xl mx-auto px-5 py-16">
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h2 className="text-2xl font-bold text-red-600">
              Profile could not be loaded
            </h2>

            <p className="text-gray-500 mt-3">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLicenseStatus = licenseStatus();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-950 text-white px-6 md:px-10 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            DriveEasy Driver
          </h1>

          <p className="text-gray-300">
            Welcome, {profile.full_name}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/driver/dashboard")}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/driver/jobs")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            My Jobs
          </button>

          <button
            type="button"
            onClick={() => navigate("/driver/earnings")}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
          >
            Earnings
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900">
            My Profile
          </h2>

          <p className="text-gray-500 mt-2">
            View your driver information and update your contact
            details.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-7">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          <section className="lg:col-span-1 space-y-7">
            <div className="bg-white rounded-2xl shadow p-6 text-center">
              <h3 className="text-xl font-bold mb-5">
                Driver Photo
              </h3>

              <div className="flex justify-center">
                {driverPhotoPreview ||
                profile.driver_photo ? (
                  <img
                    src={
                      driverPhotoPreview ||
                      `${API_URL}/uploads/${profile.driver_photo}`
                    }
                    alt={profile.full_name}
                    className="w-48 h-48 rounded-full object-cover border-4 border-slate-200"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center text-7xl">
                    👤
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleDriverPhotoChange}
                className="mt-6 block w-full text-sm"
              />

              <button
                type="button"
                disabled={
                  !driverPhoto || uploadingDriverPhoto
                }
                onClick={uploadDriverPhoto}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold"
              >
                {uploadingDriverPhoto
                  ? "Uploading..."
                  : "Update Driver Photo"}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-bold mb-5">
                Account Status
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Driver Status
                  </p>

                  <span
                    className={`inline-block mt-2 px-4 py-2 rounded-full font-semibold ${
                      profile.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : profile.status === "Off Duty"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {profile.status || "-"}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Experience
                  </p>

                  <p className="font-semibold mt-1">
                    {profile.experience_years || 0} years
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Driver Fee Per Day
                  </p>

                  <p className="font-semibold text-green-700 mt-1">
                    {formatCurrency(
                      profile.driver_fee_per_day
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Delivery Fee
                  </p>

                  <p className="font-semibold text-green-700 mt-1">
                    {formatCurrency(profile.delivery_fee)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-2 space-y-7">
            <form
              onSubmit={handleSaveProfile}
              className="bg-white rounded-2xl shadow p-7"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold">
                  Personal Information
                </h3>

                <p className="text-gray-500 mt-1">
                  Only contact information can be edited by the
                  driver.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={profile.full_name || ""}
                    disabled
                    className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    value={profile.email || ""}
                    disabled
                    className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NRIC Number
                  </label>

                  <input
                    type="text"
                    value={profile.nric_no || ""}
                    disabled
                    className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Emergency Contact
                  </label>

                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    placeholder="Emergency contact number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-lg font-semibold"
                >
                  {saving
                    ? "Saving..."
                    : "Save Profile Changes"}
                </button>
              </div>
            </form>

            <div className="bg-white rounded-2xl shadow p-7">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold">
                    Driving Licence
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Licence information is controlled by the
                    administrator.
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full font-semibold ${currentLicenseStatus.style}`}
                >
                  {currentLicenseStatus.label}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
                <div>
                  <p className="text-sm text-gray-500">
                    Licence Number
                  </p>

                  <p className="font-semibold mt-1">
                    {profile.license_no || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Licence Expiry Date
                  </p>

                  <p className="font-semibold mt-1">
                    {formatDate(profile.license_validity)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-bold text-lg mb-4">
                  Licence Photo
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    {licensePhotoPreview ||
                    profile.license_photo ? (
                      <img
                        src={
                          licensePhotoPreview ||
                          `${API_URL}/uploads/${profile.license_photo}`
                        }
                        alt="Driving licence"
                        className="w-full max-h-72 object-contain border rounded-xl bg-gray-50"
                      />
                    ) : (
                      <div className="w-full h-52 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                        No licence photo uploaded
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a clear image of your current driving
                      licence.
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLicensePhotoChange}
                      className="block w-full text-sm"
                    />

                    <button
                      type="button"
                      disabled={
                        !licensePhoto ||
                        uploadingLicensePhoto
                      }
                      onClick={uploadLicensePhoto}
                      className="mt-5 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold"
                    >
                      {uploadingLicensePhoto
                        ? "Uploading..."
                        : "Update Licence Photo"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DriverProfile;
