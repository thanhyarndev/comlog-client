// src/hooks/api/employee.ts
import axios from "axios";
import type { Employee } from "@/types/employee";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/employee`;

export async function getEmployees(): Promise<Employee[]> {
  const res = await axios.get(API_BASE);
  return res.data.map((e: any) => ({
    id: e._id,
    name: e.name,
    alias: e.alias,
    gender: e.gender,
  }));
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const res = await axios.get<Employee>(`${API_BASE}/${id}`);
  return res.data;
}

export async function createEmployee(
  payload: Omit<Employee, "id">
): Promise<Employee> {
  const res = await axios.post<Employee>(API_BASE, payload);
  console.log("📤 Gửi yêu cầu tạo nhân viên...", payload);
  console.log("📤 Gửi yêu cầu tạo nhân viên...", res);

  return res.data;
}

export async function updateEmployee(
  id: string,
  payload: Partial<Employee>
): Promise<Employee> {
  const res = await axios.put<Employee>(`${API_BASE}/${id}`, payload);
  return res.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await axios.delete(`${API_BASE}/${id}`);
}

export async function loginWithPin(pin: string): Promise<{ success: boolean }> {
  const res = await axios.post(
    `${API_BASE}/login-pin`,
    { pin },
    { withCredentials: true }
  );
  return res.data;
}

export async function getUserRole(): Promise<"admin" | "guest"> {
  const res = await axios.get(`${API_BASE}/whoami`, { withCredentials: true });
  return res.data.role;
}