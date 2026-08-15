import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem("customer"));

  const logout = () => {
    localStorage.removeItem("customer");
    navigate("/");
  };

  return (
    <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        🚗 DriveEasy
      </h1>

      <div className="flex gap-6 items-center">
        <button onClick={() => navigate("/")}>
          Home
        </button>

        {customer && (
          <>
            <button onClick={() => navigate("/profile")}>
              My Profile
            </button>

            <button onClick={() => navigate("/my-bookings")}>
              My Bookings
            </button>
          </>
        )}

        {customer ? (
          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;