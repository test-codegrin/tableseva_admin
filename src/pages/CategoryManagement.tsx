"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  TextArea,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Chip,
  RadioGroup,
  Radio,
} from "@heroui/react";

const API_BASE = "https://1n2nng7m-3000.inc1.devtunnels.ms";

export default function CategoryManagement() {
  const [isOpen, setIsOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch {
      showToast("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", status: "active" });
    setIsOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.categories_id);
    setForm({
      name: cat.name,
      description: cat.description,
      status: cat.status,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return showToast("Name required");

    setSaving(true);
    try {
      const url =
        editingId !== null
          ? `${API_BASE}/categories/${editingId}`
          : `${API_BASE}/categories`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        showToast(editingId ? "Updated" : "Created");
        fetchCategories();
        setIsOpen(false);
      } else {
        showToast("Failed");
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
      await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
      });
      showToast("Deleted");
      fetchCategories();
    } catch {
      showToast("Error");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category Management</h2>
        <Button className="bg-blue-500 text-white" onPress={openAdd}>
          + Add Category
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading...</p>
        </div>
      ) : (
       <Table aria-label="Category Table">
  <Table.Header>
    <Table.Column key="id">ID</Table.Column>
    <Table.Column key="name">NAME</Table.Column>
    <Table.Column key="description">DESCRIPTION</Table.Column>
    <Table.Column key="status">STATUS</Table.Column>
    <Table.Column key="actions">ACTIONS</Table.Column>
  </Table.Header>

  <Table.Body items={categories}>
    {(cat: any) => (
      <Table.Row key={cat.categories_id}>
        <Table.Cell>#{cat.categories_id}</Table.Cell>
        <Table.Cell>{cat.name}</Table.Cell>
        <Table.Cell>{cat.description}</Table.Cell>
        <Table.Cell>
          <Chip
            color={cat.status === "active" ? "success" : "default"}
            variant="soft"
          >
            {cat.status}
          </Chip>
        </Table.Cell>
        <Table.Cell className="flex gap-2">
          <Button size="sm" onPress={() => openEdit(cat)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500"
            onPress={() => handleDelete(cat.categories_id)}
          >
            Delete
          </Button>
        </Table.Cell>
      </Table.Row>
    )}
  </Table.Body>
</Table>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <ModalHeader>
          {editingId ? "Edit Category" : "Add Category"}
        </ModalHeader>

        <ModalBody className="space-y-4">
          <Input
            placeholder="Enter name"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <TextArea
            placeholder="Enter description"
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <RadioGroup
              aria-label="Status"
              value={form.status}
              onChange={(value: string) =>
                setForm({ ...form, status: value })
              }
            >
              <Radio value="active">Active</Radio>
              <Radio value="inactive">Inactive</Radio>
            </RadioGroup>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button onPress={() => setIsOpen(false)}>Cancel</Button>
          <Button
            className="bg-blue-500 text-white"
            isDisabled={saving}
            onPress={handleSave}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}