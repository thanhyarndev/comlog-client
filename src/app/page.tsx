"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/hooks/api/employee";

export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    getUserRole().then((role) => {
      if (role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/employees");
      }
    });
  }, [router]);

  return null;
}
