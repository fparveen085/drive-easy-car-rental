import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManageCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    const admin = JSON.parse(
      localStorage.getItem("admin")
    );

    if (!admin) {
      alert("Please login as admin");
      navigate("/admin/login");
      return;
    }

    const loadCustomers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/customers`
        );

        setCustomers(response.data);
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data?.message ||
            "Failed to load customers"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const startEdit = (customer) => {
    setEditingCustomer(customer);

    setForm({
      full_name: customer.full_name || "",
      email: customer.email || "",
      phone: customer.phone || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const cancelEdit = () => {
    setEditingCustomer(null);

    setForm({
      full_name: "",
      email: "",
      phone: ""
    });
  };

  const updateCustomer = async () => {
    if (
      !form.full_name.trim() ||
      !form.email.trim()
    ) {
      alert("Full name and email are required");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/admin/customers/${editingCustomer.customer_id}`,
        {
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim()
        }
      );

      setCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.customer_id ===
          editingCustomer.customer_id
            ? response.data.customer
            : customer
        )
      );

      alert("Customer updated successfully");
      cancelEdit();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to update customer"
      );
    }
  };

  const deleteCustomer = async (customerId) => {
    const confirmed = window.confirm(
      "Delete this customer permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/customers/${customerId}`
      );

      setCustomers((currentCustomers) =>
        currentCustomers.filter(
          (customer) =>
            customer.customer_id !== customerId
        )
      );

      alert("Customer deleted successfully");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete customer"
      );
    }
  };

  const filteredCustomers = customers.filter(
    (customer) => {
      const keyword = search
        .trim()
        .toLowerCase();

      return (
        customer.full_name
          ?.toLowerCase()
          .includes(keyword) ||
        customer.email
          ?.toLowerCase()
          .includes(keyword) ||
        customer.phone
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-bold">
          Loading Customers...
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
            Manage Customers
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
        {editingCustomer && (
          <section className="bg-white rounded-2xl shadow p-7 mb-10">
            <h2 className="text-3xl font-bold mb-2">
              Edit Customer
            </h2>

            <p className="text-gray-500 mb-6">
              Update the selected customer details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block font-semibold mb-2">
                  Full Name
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
                  Email
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
                  Phone
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={updateCustomer}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Save Changes
              </button>

              <button
                onClick={cancelEdit}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold">
                Customer List
              </h2>

              <p className="text-gray-500">
                Total customers: {customers.length}
              </p>
            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, email or phone"
              className="w-full md:w-80 border rounded-xl px-4 py-3 bg-white"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <h3 className="text-xl font-bold">
                No customers found
              </h3>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="px-5 py-4">
                        Customer
                      </th>

                      <th className="px-5 py-4">
                        Email
                      </th>

                      <th className="px-5 py-4">
                        Phone
                      </th>

                      <th className="px-5 py-4">
                        Registered
                      </th>

                      <th className="px-5 py-4">
                        Bookings
                      </th>

                      <th className="px-5 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map(
                      (customer) => (
                        <tr
                          key={customer.customer_id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                {customer.full_name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {customer.full_name}
                                </p>

                                <p className="text-sm text-gray-500">
                                  ID:{" "}
                                  {customer.customer_id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {customer.email}
                          </td>

                          <td className="px-5 py-4">
                            {customer.phone || "-"}
                          </td>

                          <td className="px-5 py-4">
                            {formatDate(
                              customer.created_at
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                              {customer.total_bookings ||
                                0}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  startEdit(customer)
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  deleteCustomer(
                                    customer.customer_id
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManageCustomers;