import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/sessions`;

export interface CreateSessionPayload {
  expenseId: string;
  items: string[];
}

export interface Session {
  _id: string;
  expenseId: string;
  items: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tạo session mới
export async function createSession(
  payload: CreateSessionPayload
): Promise<Session> {
  const res = await axios.post(BASE_URL, payload);
  return res.data;
}

// Lấy toàn bộ session
export async function getAllSessions(): Promise<Session[]> {
  const res = await axios.get(BASE_URL);
  return res.data;
}

// Lấy 1 session theo ID
export async function getSessionById(id: string): Promise<Session> {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
}

// Tắt session
export async function deactivateSession(
  id: string,
  isActive: boolean
): Promise<Session> {
  const res = await axios.put(`${BASE_URL}/${id}/deactivate`, { isActive });
  return res.data;
}


// Cập nhật danh sách món ăn
export async function updateSessionItems(
  id: string,
  items: string[]
): Promise<Session> {
  const res = await axios.put(`${BASE_URL}/${id}/items`, { items });
  return res.data;
}

