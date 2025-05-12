// src/hooks/api/employee.ts
import axios from 'axios'
import type { Employee } from '@/types/employee'

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/employee`

export async function getEmployees(): Promise<Employee[]> {
  const res = await axios.get<Employee[]>(API_BASE)
  return res.data
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const res = await axios.get<Employee>(`${API_BASE}/${id}`)
  return res.data
}

export async function createEmployee(payload: Omit<Employee, 'id'>): Promise<Employee> {
  const res = await axios.post<Employee>(API_BASE, payload)
  console.log('📤 Gửi yêu cầu tạo nhân viên...', payload);
  console.log('📤 Gửi yêu cầu tạo nhân viên...', res);
  
  return res.data
}

export async function updateEmployee(id: string, payload: Partial<Employee>): Promise<Employee> {
  const res = await axios.put<Employee>(`${API_BASE}/${id}`, payload)
  return res.data
}

export async function deleteEmployee(id: string): Promise<void> {
  await axios.delete(`${API_BASE}/${id}`)
}
