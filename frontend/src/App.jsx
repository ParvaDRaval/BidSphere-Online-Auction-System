import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyMail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CreateAuction from "./pages/CreateAuction";
import EditAuctionDraft from "./pages/EditAuctionDraft";
import AuctionDetails from "./pages/AuctionDetails";
import UserDashboard from "./pages/UserDashboard";
import MyListings from "./pages/MyListings";
import PayFees from "./pages/PayFees";


import Contact from "./pages/contact";
function App() {
  return (
    <div className="bg-[#fdfbf6] min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:name" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />
        <Route path="/create-auction" element={<CreateAuction />} />
  <Route path="/auction/:id" element={<AuctionDetails />} />
    <Route path="/dashboard" element={<UserDashboard />} />
  <Route path="/my-listings" element={<MyListings />} />
    <Route path="/pay-fee" element={<PayFees />} />
    <Route path="/pay-fee/:auctionId" element={<PayFees />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/edit-auction-draft/:id" element={<EditAuctionDraft />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
