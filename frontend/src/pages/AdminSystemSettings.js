import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AdminSystemSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/admin/system-settings`
      );

      setSettings(response.data);
    } catch (error) {
      console.error(
        "Failed to load system settings:",
        error.response?.data || error.message
      );

      alert("Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleValueChange = (settingId, value) => {
    setSettings((currentSettings) =>
      currentSettings.map((setting) =>
        setting.setting_id === settingId
          ? {
              ...setting,
              setting_value: value
            }
          : setting
      )
    );
  };

  const saveSetting = async (setting) => {
    try {
      setSavingId(setting.setting_id);

      await axios.put(
        `${API_URL}/admin/system-settings/${setting.setting_id}`,
        {
          setting_value: setting.setting_value
        }
      );

      alert("Setting updated successfully");
    } catch (error) {
      console.error(
        "Failed to update setting:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update setting"
      );
    } finally {
      setSavingId(null);
    }
  };

  const formatSettingName = (name) => {
    return name
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            System Settings
          </h1>

          <p className="text-gray-600 mt-2">
            Manage service charges and company information.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            Loading system settings...
          </div>
        ) : settings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            No system settings found.
          </div>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.setting_id}
                className="bg-white rounded-xl shadow p-6"
              >
                <div className="grid md:grid-cols-3 gap-5 items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatSettingName(
                        setting.setting_name
                      )}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {setting.description ||
                        "No description available"}
                    </p>
                  </div>

                  <input
                    type={
                      setting.setting_name.includes(
                        "charge"
                      ) ||
                      setting.setting_name.includes(
                        "fee"
                      ) ||
                      setting.setting_name.includes(
                        "hours"
                      )
                        ? "number"
                        : "text"
                    }
                    value={setting.setting_value}
                    onChange={(event) =>
                      handleValueChange(
                        setting.setting_id,
                        event.target.value
                      )
                    }
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={() => saveSetting(setting)}
                    disabled={
                      savingId === setting.setting_id
                    }
                    className="bg-blue-700 text-white px-5 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-60"
                  >
                    {savingId === setting.setting_id
                      ? "Saving..."
                      : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSystemSettings;