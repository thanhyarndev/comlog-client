"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ExpenseTotals({
  expenseTotals,
}: {
  expenseTotals: { title: string; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💼 Tổng tiền theo khoản mục</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Khoản mục</th>
              <th className="px-4 py-2 text-right">Tổng chi</th>
            </tr>
          </thead>
          <tbody>
            {expenseTotals.map((exp, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{exp.title}</td>
                <td className="px-4 py-2 text-right">
                  {exp.total.toLocaleString()} ₫
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
