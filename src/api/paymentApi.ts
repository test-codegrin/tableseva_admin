import api from "./apiClient";
import type {
  UpdateRazorpayKeysPayload,
  UpdateRazorpayKeysResponse,
} from "../types/dataTypes";

export const updateRazorpayKeysApi = async (
  data: UpdateRazorpayKeysPayload,
): Promise<UpdateRazorpayKeysResponse> => {
  const response = await api.post<UpdateRazorpayKeysResponse>(
    "/vendor/update-razorpay",
    data,
  );
  return response.data;
};
