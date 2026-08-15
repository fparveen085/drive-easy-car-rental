import { useState } from "react";
import axios from "axios";

function Contact() {
  const customer = JSON.parse(
    localStorage.getItem("customer")
  );

  const [name, setName] = useState(
    customer?.full_name || ""
  );

  const [email, setEmail] = useState(
    customer?.email || ""
  );

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setSending(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/contact-messages`,
        {
          full_name: name,
          email: email,
          subject: subject,
          message: message,
        }
      );

      alert(
        response.data.message ||
          "Message sent successfully"
      );

      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      className="px-6 md:px-10 py-16 bg-white"
    >
      <h2 className="text-3xl font-bold text-center mb-4">
        Contact Us
      </h2>

      <p className="text-center text-gray-600 mb-10">
        Need help? Contact our car rental support team.
      </p>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-gray-100 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">
            DriveEasy Car Rental
          </h3>

          <div className="space-y-3 text-gray-700">
            <p>📍 Kuala Lumpur, Malaysia</p>
            <p>📞 +60 12-345 6789</p>
            <p>✉️ support@driveeasy.com</p>
            <p>
              🕒 Monday - Sunday, 8:00 AM - 10:00 PM
            </p>
          </div>
        </div>

        <form
          onSubmit={sendMessage}
          className="bg-gray-100 p-8 rounded-2xl"
        >
          <input
            type="text"
            className="w-full p-3 mb-4 rounded-lg border"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            className="w-full p-3 mb-4 rounded-lg border"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            className="w-full p-3 mb-4 rounded-lg border"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            className="w-full p-3 mb-4 rounded-lg border"
            rows="4"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            type="submit"
            disabled={sending}
            className={`w-full text-white py-3 rounded-lg font-semibold ${
              sending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto mt-10 rounded-2xl overflow-hidden shadow-lg">
        <iframe
          title="DriveEasy location map"
          src="https://www.google.com/maps?q=Kuala+Lumpur,+Malaysia&output=embed"
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>
    </section>
  );
}

export default Contact;