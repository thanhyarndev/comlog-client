import axios from "axios";
import type { FoodItem } from "@/types/foodItem";


const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

// ✅ Lấy danh sách món ăn
export const getFoodItems = async (): Promise<FoodItem[]> => {
  const res = await axios.get(`${BASE_URL}/food-items`);
  return res.data;
};

// ✅ Tạo món ăn mới
export const createFoodItem = async (data: {
  name: string;
  type: "main" | "side";
  price: number;
}): Promise<FoodItem> => {
  const res = await axios.post(`${BASE_URL}/food-items`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ✅ Cập nhật món ăn
export const updateFoodItem = async (
  id: string,
  data: Partial<{
    name: string;
    type: "main" | "side";
    price: number;
  }>
): Promise<FoodItem> => {
  const res = await axios.put(`${BASE_URL}/food-items/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ✅ Xoá món ăn
export const deleteFoodItem = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/food-items/${id}`);
};
