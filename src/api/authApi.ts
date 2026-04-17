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