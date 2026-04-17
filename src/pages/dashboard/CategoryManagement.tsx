"use client";

import { useEffect, useState } from "react";
import type { Category, Pagination } from "../../types/dataTypes";

const API_BASE = "https://1n2nng7m-3000.inc1.devtunnels.ms";

function Badge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-green-600" : "bg-gray-400"
        }`}
      />
      {status}
    </span>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [toast, setToast] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to fetch categories");
      }
    } catch {
      setError("Could not reach the server. Is it running on localhost:3000?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter((c) => {
    const matchFilter = filter === "all" || c.status === filter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.status === "active").length,
    inactive: categories.filter((c) => c.status === "inactive").length,
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", status: "active" });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.categories_id);
    setForm({
      name: cat.name,
      description: cat.description,
      status: cat.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingId !== null) {
        const res = await fetch(`${API_BASE}/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Category updated");
          await fetchCategories();
          closeModal();
        } else {
          showToast(data.message || "Update failed");
        }
      } else {
        const res = await fetch(`${API_BASE}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Category added");
          await fetchCategories();
          closeModal();
        } else {
          showToast(data.message || "Create failed");
        }
      }
    } catch {
      showToast("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Category deleted");
        await fetchCategories();
      } else {
        showToast(data.message || "Delete failed");
      }
    } catch {
      showToast("Server error");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Category management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your menu categories
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          Add category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Inactive", value: stats.inactive },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg p-3.5">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" />
          </svg>
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors capitalize ${
              filter === f
                ? "border-gray-400 text-gray-800 bg-white font-medium"
                : "border-gray-200 text-gray-500 hover:text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Loading…
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-red-500">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "ID",
                  "Name",
                  "Description",
                  "Status",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No categories found
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr
                    key={cat.categories_id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-gray-400">
                      #{cat.categories_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {cat.description}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={cat.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {fmtDate(cat.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="px-2.5 py-1 text-xs border border-gray-200 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.categories_id)}
                          className="px-2.5 py-1 text-xs border border-gray-200 rounded-md text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination info */}
      {pagination && (
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>
            Showing {filtered.length} of {pagination.total}
          </span>
          <span>
            Page {pagination.page} of {pagination.total_pages} ·{" "}
            {pagination.per_page} per page
          </span>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-5">
              {editingId !== null ? "Edit category" : "Add category"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Beverages"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Short description…"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Status
                </label>
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>

                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
