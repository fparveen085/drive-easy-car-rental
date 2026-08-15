import { useEffect, useState } from "react";
import axios from "axios";

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const loadMessages = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/admin/contact-messages`
      );

      setMessages(response.data);
    } catch (err) {
      console.error("Load messages error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to load messages"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (messageId, status) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/admin/contact-messages/${messageId}/status`,
        {
          status,
        }
      );

      setMessages((previousMessages) =>
        previousMessages.map((item) =>
          item.message_id === messageId
            ? { ...item, status }
            : item
        )
      );

      if (
        selectedMessage?.message_id === messageId
      ) {
        setSelectedMessage((previous) => ({
          ...previous,
          status,
        }));
      }
    } catch (err) {
      console.error("Update status error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  const deleteMessage = async (messageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/admin/contact-messages/${messageId}`
      );

      setMessages((previousMessages) =>
        previousMessages.filter(
          (item) => item.message_id !== messageId
        )
      );

      if (
        selectedMessage?.message_id === messageId
      ) {
        setSelectedMessage(null);
      }

      alert("Message deleted successfully");
    } catch (err) {
      console.error("Delete message error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete message"
      );
    }
  };

  const openMessage = async (contactMessage) => {
    setSelectedMessage(contactMessage);

    if (contactMessage.status === "Unread") {
      await updateStatus(
        contactMessage.message_id,
        "Read"
      );
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Unread") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Replied") {
      return "bg-green-100 text-green-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Contact Messages
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
            {messages.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No contact messages available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="text-left p-4">
                        Customer
                      </th>

                      <th className="text-left p-4">
                        Subject
                      </th>

                      <th className="text-left p-4">
                        Status
                      </th>

                      <th className="text-left p-4">
                        Date
                      </th>

                      <th className="text-left p-4">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {messages.map((item) => (
                      <tr
                        key={item.message_id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <p className="font-semibold">
                            {item.full_name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {item.email}
                          </p>
                        </td>

                        <td className="p-4">
                          {item.subject}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="p-4 text-sm">
                          {new Date(
                            item.created_at
                          ).toLocaleString()}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openMessage(item)
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteMessage(
                                  item.message_id
                                )
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            {selectedMessage ? (
              <>
                <h2 className="text-2xl font-bold mb-5">
                  Message Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="font-semibold">
                      Customer Name
                    </p>

                    <p>{selectedMessage.full_name}</p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      Email
                    </p>

                    <p className="break-words">
                      {selectedMessage.email}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      Subject
                    </p>

                    <p>{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      Message
                    </p>

                    <p className="whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      Status
                    </p>

                    <select
                      value={selectedMessage.status}
                      onChange={(e) =>
                        updateStatus(
                          selectedMessage.message_id,
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-3 mt-2"
                    >
                      <option value="Unread">
                        Unread
                      </option>

                      <option value="Read">
                        Read
                      </option>

                      <option value="Replied">
                        Replied
                      </option>
                    </select>
                  </div>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    onClick={() =>
                      updateStatus(
                        selectedMessage.message_id,
                        "Replied"
                      )
                    }
                    className="block text-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
                  >
                    Reply by Email
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-10">
                Select a message to view its details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminContactMessages;