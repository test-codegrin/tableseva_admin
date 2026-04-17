import axios from "axios"
import type { RegisterPayload } from "../types/dataTypes"

const BASE_URL = "https://1n2nng7m-3000.inc1.devtunnels.ms"

// Register
export const authApi = async (data: RegisterPayload) => {
  const response = await axios.post(`${BASE_URL}/vendor/register`, data, {
    headers: { "Content-Type": "application/json" },
  })
  return response.data
}

// Login
export const loginApi = async (data: { email: string; password: string }) => {
  const response = await axios.post(`${BASE_URL}/vendor/login`, data, {
    headers: { "Content-Type": "application/json" },
  })
  return response.data
}

// ─── Categories ───────────────────────────────────────────────────────────────

// Get all categories
export const getCategoriesApi = async () => {
  const response = await axios.get(`${BASE_URL}/categories`)
  return response.data
}

// Create category
export const createCategoryApi = async (data: {
  name: string
  description: string
  status: string
}) => {
  const response = await axios.post(`${BASE_URL}/categories`, data, {
    headers: { "Content-Type": "application/json" },
  })
  return response.data
}

// Update category
export const updateCategoryApi = async (
  id: number,
  data: { name: string; description: string; status: string }
) => {
  const response = await axios.put(`${BASE_URL}/categories/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  })
  return response.data
}

// Delete category
export const deleteCategoryApi = async (id: number) => {
  const response = await axios.delete(`${BASE_URL}/categories/${id}`)
  return response.data
}