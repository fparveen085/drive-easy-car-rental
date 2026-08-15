import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyProfile from "./pages/MyProfile";
import Register from "./pages/Register";
import CarDetails from "./pages/CarDetails";
import BookingSummary from "./pages/BookingSummary";
import Payment from "./pages/Payment";
import FakeGateway from "./pages/FakeGateway";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyBookings from "./pages/MyBookings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageCars from "./pages/ManageCars";
import ManageCustomers from "./pages/ManageCustomers";
import ManageBookings from "./pages/ManageBookings";
import PaymentRecords from "./pages/PaymentRecords";
import ManageDrivers from "./pages/ManageDrivers";
import AdminSystemSettings from "./pages/AdminSystemSettings";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import DriverJobs from "./pages/DriverJobs";
import DriverEarnings from "./pages/DriverEarnings";
import DriverProfile from "./pages/DriverProfile";
import AdminContactMessages from "./pages/AdminContactMessages";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/booking/:carId" element={<Booking />} />
        <Route path="/payment/:bookingId" element={<Payment />} />
        <Route path="/booking-summary/:bookingId" element={<BookingSummary />} />
        <Route path="/gateway/:method/:bookingId" element={<FakeGateway />} />
        <Route path="/payment-success/:bookingId" element={<PaymentSuccess />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-cars" element={<ManageCars />} />
        <Route path="/admin/manage-customers" element={<ManageCustomers />} />
        <Route path="/admin/manage-bookings" element={<ManageBookings />} />
        <Route path="/admin/payment-records" element={<PaymentRecords />} />
        <Route path="/admin/manage-drivers" element={<ManageDrivers />} />
        <Route path="/admin/system-settings" element={<AdminSystemSettings />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/jobs" element={<DriverJobs />} />  
        <Route path="/driver/earnings" element={<DriverEarnings />} />
        <Route path="/driver/profile" element={<DriverProfile />}/> 
        <Route path="/admin/contact-messages" element={<AdminContactMessages />}/>   
      </Routes>
    </BrowserRouter>
  );
}

export default App;