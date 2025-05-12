'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { getEmployees } from '@/hooks/api/employee';
import type { Employee } from '@/types/employee';
import EmployeeList from '@/components/EmployeeList';
import EmployeeModal from '@/components/EmployeeModal';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchEmployees = async () => {
    const res = await getEmployees();
    if (Array.isArray(res)) setEmployees(res);
    else setEmployees([]);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.alias?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <CardDescription>Quản lý thông tin nhân viên: tên, giới tính, tên gọi khác</CardDescription>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc tên gọi khác"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <EmployeeList data={filtered} />
      </CardContent>
      <EmployeeModal open={showModal} onClose={() => setShowModal(false)} onSuccess={fetchEmployees} />
    </Card>
  );
}