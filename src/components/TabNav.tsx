"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserRole } from "@/hooks/api/employee";

const tabs = [
  { label: "Chi phí", path: "/expenses", private: true },
  { label: "Tổng quan", path: "/summary", private: true },
  { label: "Nhân viên", path: "/employees", private: false },
];

export default function TabNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<"admin" | "guest">("guest");

  useEffect(() => {
    getUserRole().then(setRole);
  }, []);

  return (
    <nav className="bg-white border-b">
      <ul className="flex space-x-4 p-4">
        {tabs.map((tab) => {
          if (tab.private && role !== "admin") return null;
          return (
            <li key={tab.path}>
              <Link
                href={tab.path}
                className={
                  pathname === tab.path
                    ? "font-semibold text-blue-600"
                    : "text-gray-600"
                }
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
