import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Reset Password</h1>
        <p className="mb-6 text-slate-600">
          This reset link is unavailable. Please contact the administrator for assistance.
        </p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
