"use client";
import React from "react";
import AppContext from "./context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function TopCollectorsChart() {
  const { topCollectors } = React.useContext(AppContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🌟 Top collectors</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCollectors}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(v: number) => `${v.toLocaleString()} ₫`} />
            <Bar dataKey="received" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
