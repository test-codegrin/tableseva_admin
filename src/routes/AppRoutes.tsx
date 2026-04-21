import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import Login from "../components/Login";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";

// Dashboard child pages
import DashboardHome from "../pages/DashboardHome";
import CategoryManagement from "../pages/CategoryManagement";
import TableManagement from "../pages/TableManagement";
import QRCodeGeneration from "../pages/QRCodeGeneration";
import Inventory from "../pages/Inventory";
import Payments from "../pages/Payments";
import LiveOrders from "../pages/LiveOrders";
import DashboardLayout from "../layout/DashboardLayout";
import ProfilePage from "../pages/ProfilePage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="category" element={<CategoryManagement />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="qr-code" element={<QRCodeGeneration />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="payments" element={<Payments />} />
          <Route path="orders" element={<LiveOrders />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
