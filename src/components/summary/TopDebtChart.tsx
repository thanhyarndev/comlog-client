"use client";
import React from "react";
import AppContext from "./context";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function TopDebtChart() {
  const { debtPerPerson } = React.useContext(AppContext);

  return (
    <>
      <CardHeader>
        <CardTitle>🧾 Top 5 người còn nợ</CardTitle>
      </CardHeader>
      <CardContent>
        {debtPerPerson.length === 0 ? (
          <p className="italic text-muted-foreground">Tất cả đã thanh toán.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={debtPerPerson}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} ₫`} />
              <Bar dataKey="debt" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </>
  );
}
