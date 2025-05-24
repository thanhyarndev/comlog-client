"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginWithPin } from "@/hooks/api/employee";
import axios from "axios";

export default function LoginPage() {
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const router = useRouter();
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullPin = pin.join("");
    if (fullPin.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    try {
      const res = await loginWithPin(fullPin);
      if (res.success) {
        router.push("/");
      } else {
        setError("Mã PIN không hợp lệ.");
      }
    } catch (err: any) {
      console.error("❌ Đăng nhập lỗi:", err);
      setError("Mã PIN không hợp lệ hoặc kết nối thất bại.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            🔒 Mã truy cập hệ thống
          </CardTitle>
          <p className="text-sm text-gray-500 text-center mt-2">
            Vui lòng nhập mã PIN gồm 6 chữ số
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2 mb-4">
            {pin.map((digit, index) => (
              <Input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  if (el) inputsRef.current[index] = el;
                }}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-12 h-12 text-center text-xl font-mono"
              />
            ))}
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center mb-2">{error}</p>
          )}
          <Button className="w-full" onClick={handleSubmit}>
            Xác nhận truy cập
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
