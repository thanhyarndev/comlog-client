"use client";
import React from "react";
import AppContext from "./context";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function RevenuePieChart() {
  const { pieData, pieColors } = React.useContext(AppContext);

  return (
    <>
      <CardHeader>
        <CardTitle>🎯 Tỷ lệ thu tiền</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              dataKey="value"
            >
              {pieData.map((_entry: any, idx: number) => (
                <Cell key={idx} fill={pieColors[idx]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
}
