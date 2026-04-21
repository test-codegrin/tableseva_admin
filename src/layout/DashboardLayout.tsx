"use client";

import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Icon, ICONS } from "../config/icons";

const navItems = [
  { label: "Dashboard", icon: ICONS.dashboard, path: "/dashboard" },
  { label: "Category Management", icon: ICONS.forkspoon, path: "/category" },
  { label: "Table Management", icon: ICONS.tableMgmt, path: "/tables" },
  { label: "QR Code Generation", icon: ICONS.qrCode, path: "/qr-code" },
  { label: "Stock / Inventory", icon: ICONS.inventory, path: "/inventory" },
  { label: "Payments", icon: ICONS.payments, path: "/payments" },
  { label: "Live Orders Tracking", icon: ICONS.liveOrders, path: "/orders" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const activeItem =
    navItems.find((item) => item.path === pathname) ?? navItems[0];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-76"
        } transition-all duration-300 bg-[#F7F7F7] border-r border-gray-100 flex flex-col shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4">
          <img src="/auth/dashlogo.png" alt="" />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 space-y-5 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path === "/dashboard" && pathname === "/");
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#CC543A] text-white"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon
                  icon={item.icon}
                  width={18}
                  className={`shrink-0 ${isActive ? "text-white" : "text-gray-400"}`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom — New Reservation + Logout */}
        <div className="px-2 pb-4 space-y-1 border-t border-gray-100 pt-3">
          {!collapsed && (
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold bg-[#CC543A] text-white hover:bg-[#b8472f] transition">
              <span>+ New Reservation</span>
            </button>
          )}
          <button
            onClick={() => navigate("/login")}
            title={collapsed ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
          >
            <Icon icon={ICONS.logout} width={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 border-b border-gray-100 px-6 py-8 flex items-center justify-between shrink-0">
          {/* Left — collapse toggle + page title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon
                icon={collapsed ? ICONS.chevronRight : ICONS.chevronLeft}
                width={18}
              />
            </button>
          </div>

          {/* Right — avatar */}
          <div className="flex items-center gap-3">
            <Icon icon={ICONS.moon} width={18} className="text-black/50" />
            <Icon icon={ICONS.question} width={18} className="text-black/50" />

            <div className="w-8 h-8 rounded-full bg-[#CC543A]/10 flex items-center justify-center">
              <Icon icon={ICONS.account} width={18} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
