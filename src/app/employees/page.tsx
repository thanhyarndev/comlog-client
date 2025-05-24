"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, User } from "lucide-react";
import { getEmployees } from "@/hooks/api/employee";
import type { Employee } from "@/types/employee";
import EmployeeModal from "@/components/EmployeeModal";
import { getUserRole } from "@/hooks/api/employee";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<"guest" | "admin">("guest");
  const router = useRouter();

  const fetchEmployees = async () => {
    const res = await getEmployees();
    if (Array.isArray(res)) setEmployees(res);
    else setEmployees([]);
  };

  useEffect(() => {
    fetchEmployees();
    getUserRole().then(setRole);
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.alias?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <CardDescription>
            Quản lý thông tin nhân viên: tên, giới tính, tên gọi khác
          </CardDescription>
        </div>
        {role === "admin" && (
          <Button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
          </Button>
        )}
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

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((emp) => (
            <Card
              key={emp.id}
              onClick={() => router.push(`/summary/${emp.id}`)}
              className="cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
            >
              <CardContent className="flex flex-col p-4 gap-2">
                <div className="flex items-center gap-2">
                  <User
                    className={`w-5 h-5 ${
                      emp.gender === "female"
                        ? "text-pink-500"
                        : "text-blue-500"
                    }`}
                  />
                  <div className="font-medium text-base leading-tight">
                    {emp.name}
                    {emp.alias && (
                      <div className="text-sm text-muted-foreground">
                        ({emp.alias})
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-sm bg-gray-100 rounded px-2 py-0.5 w-fit text-gray-700">
                  {emp.gender === "male" ? "Nam" : "Nữ"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {role === "admin" && (
        <EmployeeModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchEmployees}
        />
      )}
    </Card>
  );
}
