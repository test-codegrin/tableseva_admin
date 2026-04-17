"use client";

import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Icon, ICONS } from "../components/icons";

const navItems = [
  { label: "Dashboard",            icon: ICONS.dashboard,    path: "/dashboard"           },
  { label: "Category Management",  icon: ICONS.categoryMgmt, path: "/dashboard/category"  },
  { label: "Table Management",     icon: ICONS.tableMgmt,    path: "/dashboard/tables"    },
  { label: "QR Code Generation",   icon: ICONS.qrCode,       path: "/dashboard/qr-code"   },
  { label: "Stock / Inventory",    icon: ICONS.inventory,    path: "/dashboard/inventory" },
  { label: "Payments",             icon: ICONS.payments,     path: "/dashboard/payments"  },
  { label: "Live Orders Tracking", icon: ICONS.liveOrders,   path: "/dashboard/orders"    },
];

export default function Dashboard() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();               // derive active item from URL
  const [collapsed, setCollapsed] = useState(false);

  const activeItem = navItems.find((item) => item.path === pathname) ?? navItems[0];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ── Sidebar (always visible) ───────────────────────────── */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } transition-all duration-300 bg-white shadow-lg flex flex-col shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          {!collapsed && (
            <span className="text-lg font-bold text-green-600 tracking-tight">
              🍽 TableSeva
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon icon={collapsed ? ICONS.chevronRight : ICONS.chevronLeft} width={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  icon={item.icon}
                  width={20}
                  className={`shrink-0 ${isActive ? "text-green-600" : "text-gray-400"}`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 border-t border-gray-100 pt-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <Icon icon={ICONS.logout} width={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content (only this part changes) ─────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{activeItem.label}</h1>
            <p className="text-xs text-gray-400">TableSeva Admin Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Icon icon={ICONS.account} width={18} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </header>

        {/* ↓ Child route pages render here */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}