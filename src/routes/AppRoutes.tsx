import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import RegisterPage from "../pages/RegisterPage";
import Login from "../components/Login";

// Dashboard child pages
import DashboardHome from "../pages/DashboardHome";
import CategoryManagement from "../pages/CategoryManagement";
import TableManagement from "../pages/TableManagement";
import QRCodeGeneration from "../pages/QRCodeGeneration";
import Inventory from "../pages/Inventory";
import Payments from "../pages/Payments";
import LiveOrders from "../pages/LiveOrders";
import DashboardLayout from "../layout/DashboardLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard layout — sidebar & header stay mounted */}``
        <Route path="/" element={<DashboardLayout />}>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}