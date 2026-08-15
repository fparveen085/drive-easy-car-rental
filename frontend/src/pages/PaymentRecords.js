import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function PaymentRecords() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));

    if (!admin) {
      alert("Please login as admin");
      navigate("/admin/login");
      return;
    }

    const loadPayments = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/payments`
        );

        setPayments(response.data);
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data?.message ||
            "Failed to load payment records"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [navigate]);

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

    return new Date(date).toLocaleString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const paymentStatusStyle = (status) => {
    if (status === "Paid") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Failed") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Refunded") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const filteredPayments = payments.filter((payment) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      payment.booking_reference
        ?.toLowerCase()
        .includes(keyword) ||
      payment.customer_name
        ?.toLowerCase()
        .includes(keyword) ||
      payment.transaction_reference
        ?.toLowerCase()
        .includes(keyword) ||
      payment.payment_method
        ?.toLowerCase()
        .includes(keyword);

    const matchesStatus =
      statusFilter === "All" ||
      payment.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPaidRevenue = payments
    .filter((payment) => payment.payment_status === "Paid")
    .reduce(
      (total, payment) =>
        total + Number(payment.payment_amount || 0),
      0
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-bold">
          Loading Payment Records...
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
            Payment Records
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
        <div className="mb-8">
          <h2 className="text-4xl font-bold">
            Payment Records
          </h2>

          <p className="text-gray-500 mt-2">
            View all customer payment transactions.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Total Payment Records
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {payments.length}
            </h3>

            <p className="text-3xl mt-4">💳</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Successful Payments
            </p>

            <h3 className="text-4xl font-bold mt-2 text-green-700">
              {
                payments.filter(
                  (payment) =>
                    payment.payment_status === "Paid"
                ).length
              }
            </h3>

            <p className="text-3xl mt-4">✅</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Total Paid Revenue
            </p>

            <h3 className="text-3xl font-bold mt-2 text-green-700">
              {formatCurrency(totalPaidRevenue)}
            </h3>

            <p className="text-3xl mt-4">💰</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search booking, customer, transaction or method"
              className="border rounded-xl px-4 py-3"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="border rounded-xl px-4 py-3"
            >
              <option value="All">
                All Payment Status
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Failed">
                Failed
              </option>

              <option value="Refunded">
                Refunded
              </option>
            </select>
          </div>
        </section>

        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h3 className="text-xl font-bold">
              No payment records found
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-5 py-4">
                      Transaction
                    </th>

                    <th className="px-5 py-4">
                      Booking Reference
                    </th>

                    <th className="px-5 py-4">
                      Customer
                    </th>

                    <th className="px-5 py-4">
                      Vehicle
                    </th>

                    <th className="px-5 py-4">
                      Method
                    </th>

                    <th className="px-5 py-4">
                      Amount
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.payment_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {payment.transaction_reference}
                      </td>

                      <td className="px-5 py-4">
                        {payment.booking_reference}
                      </td>

                      <td className="px-5 py-4">
                        {payment.customer_name}
                      </td>

                      <td className="px-5 py-4">
                        {payment.vehicle_name}
                      </td>

                      <td className="px-5 py-4">
                        {payment.payment_method}
                      </td>

                      <td className="px-5 py-4 font-semibold text-green-700">
                        {formatCurrency(
                          payment.payment_amount
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentStatusStyle(
                            payment.payment_status
                          )}`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {formatDate(
                          payment.payment_date ||
                            payment.created_at
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PaymentRecords;