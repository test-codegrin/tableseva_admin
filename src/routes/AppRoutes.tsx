import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import RegisterPage from "../pages/RegisterPage";
import Login from "../components/Login";
import Dashboard from "../pages/Dashboard";

// Dashboard child pages
import DashboardHome from "../pages/dashboard/DashboardHome";
import CategoryManagement from "../pages/dashboard/CategoryManagement";
import TableManagement from "../pages/dashboard/TableManagement";
import QRCodeGeneration from "../pages/dashboard/QRCodeGeneration";
import Inventory from "../pages/dashboard/Inventory";
import Payments from "../pages/dashboard/Payments";
import LiveOrders from "../pages/dashboard/LiveOrders";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard layout — sidebar & header stay mounted */}``
        <Route path="/dashboard" element={<Dashboard />}>
          {/* /dashboard  → DashboardHome */}
          <Route index element={<DashboardHome />} />

          {/* /dashboard/category, /tables, etc. → each child page */}
          <Route path="category"   element={<CategoryManagement />} />
          <Route path="tables"     element={<TableManagement />} />
          <Route path="qr-code"    element={<QRCodeGeneration />} />
          <Route path="inventory"  element={<Inventory />} />
          <Route path="payments"   element={<Payments />} />
          <Route path="orders"     element={<LiveOrders />} />

          {/* Any unknown /dashboard/* → back to dashboard home */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}