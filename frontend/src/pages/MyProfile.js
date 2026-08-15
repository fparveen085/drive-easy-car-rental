import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function MyProfile() {
  const customer = JSON.parse(localStorage.getItem("customer"));

  const [fullName, setFullName] = useState(
    customer?.full_name || ""
  );

  const [email, setEmail] = useState(
    customer?.email || ""
  );

  const [phone, setPhone] = useState(
    customer?.phone || ""
  );

  const [nationality, setNationality] = useState("");
  const [icPassportNo, setIcPassportNo] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseValidity, setLicenseValidity] = useState("");

  const [licensePhoto, setLicensePhoto] = useState(null);
  const [preview, setPreview] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!customer?.customer_id) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/customer/profile/${customer.customer_id}`
        );

        const data = res.data;

        setFullName(
          data.full_name || customer?.full_name || ""
        );

        setEmail(
          data.email || customer?.email || ""
        );

        setPhone(
          data.phone || customer?.phone || ""
        );

        setNationality(data.nationality || "");
        setIcPassportNo(data.ic_passport_no || "");
        setAddress(data.address || "");
        setLicenseNo(data.license_no || "");

        setLicenseValidity(
          data.license_validity
            ? data.license_validity.split("T")[0]
            : ""
        );

        if (data.license_photo) {
          setPreview(
            `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/uploads/${data.license_photo}`
          );
        }
      } catch (err) {
        console.error("Profile loading error:", err);
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  // Reload only when the authenticated customer ID changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.customer_id]);
   const saveProfile = async () => {
  if (!customer?.customer_id) {
    alert("Customer ID not found. Please login again.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("full_name", fullName);
    formData.append("phone", phone);
    formData.append("nationality", nationality);
    formData.append("ic_passport_no", icPassportNo);
    formData.append("address", address);
    formData.append("license_no", licenseNo);
    formData.append("license_validity", licenseValidity);

    if (licensePhoto) {
      formData.append("license_photo", licensePhoto);
    }

    const response = await axios.put(
      `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/customer/profile/${customer.customer_id}`,
      formData
    );

    alert(response.data.message || "Profile updated successfully");

    localStorage.setItem(
      "customer",
      JSON.stringify({
        ...customer,
        full_name: fullName,
        phone: phone,
      })
    );

    window.location.reload();
  } catch (err) {
    console.error(err);
    console.log(err.response?.data);

    alert(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Update failed"
    );
  }
};

  const changePassword = async () => {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/customer/change-password/${customer.customer_id}`,
        {
          currentPassword,
          newPassword,
        }
      );

      alert(res.data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Failed to change password."
      );
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-20 text-xl">
          Loading...
        </div>
      </>
    );
  }
    return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8">
            My Profile
          </h1>

          <h2 className="text-2xl font-semibold mb-5">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Email
              </label>

              <input
                type="email"
                value={email}
                readOnly
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Nationality
              </label>

              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Enter your nationality"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                IC / Passport Number
              </label>

              <input
                type="text"
                value={icPassportNo}
                onChange={(e) => setIcPassportNo(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Enter IC or passport number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-semibold">
                Address
              </label>

              <textarea
                rows="4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Enter your address"
              />
            </div>
          </div>

          <hr className="my-8" />

          <h2 className="text-2xl font-semibold mb-5">
            Driving Licence Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold">
                Licence Number
              </label>

              <input
                type="text"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Enter licence number"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Licence Expiry Date
              </label>

              <input
                type="date"
                value={licenseValidity}
                onChange={(e) =>
                  setLicenseValidity(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-semibold">
                Upload Driving Licence
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];

                  if (selectedFile) {
                    setLicensePhoto(selectedFile);
                    setPreview(
                      URL.createObjectURL(selectedFile)
                    );
                  }
                }}
                className="w-full border rounded-lg p-3"
              />
            </div>
          </div>

          {preview && (
            <div className="mt-6">
              <label className="block mb-3 font-semibold">
                Driving Licence Preview
              </label>

              <img
                src={preview}
                alt="Driving Licence"
                className="w-72 max-w-full border rounded-lg shadow"
              />
            </div>
          )}

          <hr className="my-8" />

          <h2 className="text-2xl font-semibold mb-5">
            Profile Status
          </h2>

          {fullName &&
          phone &&
          nationality &&
          icPassportNo &&
          address &&
          licenseNo &&
          licenseValidity &&
          preview ? (
            <div className="bg-green-100 border border-green-300 rounded-lg p-5 mb-8">
              <h3 className="text-green-700 text-xl font-bold">
                ✅ Profile Complete
              </h3>

              <p className="text-green-700 mt-2">
                Your profile is complete. You are eligible to
                book Self Drive vehicles.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-5 mb-8">
              <h3 className="text-yellow-700 text-xl font-bold">
                ⚠ Profile Incomplete
              </h3>

              <p className="text-yellow-700 mt-2">
                Please complete all fields and upload your
                driving licence before booking a Self Drive
                vehicle.
              </p>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={saveProfile}
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg font-semibold"
            >
              Save Profile
            </button>
          </div>
                    <hr className="my-10" />

          <h2 className="text-2xl font-semibold mb-6">
            Change Password
          </h2>

          <div className="grid grid-cols-1 gap-6">

            <div>
              <label className="block mb-2 font-semibold">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                className="w-full border rounded-lg p-3"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                className="w-full border rounded-lg p-3"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full border rounded-lg p-3"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={changePassword}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-semibold"
              >
                Change Password
              </button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

export default MyProfile;
