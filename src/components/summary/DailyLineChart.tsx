"use client";
import React from "react";
import AppContext from "./context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function DailyLineChart() {
  const { dailyData } = React.useContext(AppContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Chi tiêu theo ngày</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(v: number) => `${v.toLocaleString()} ₫`} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
