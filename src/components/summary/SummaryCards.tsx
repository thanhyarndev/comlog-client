import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalAmount: number;
  totalReceived: number;
  totalDebt: number;
  txCount: number;
  latestDate: string;
};

export default function SummaryCards({
  totalAmount,
  totalReceived,
  totalDebt,
  txCount,
  latestDate,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
      {[
        { title: "Tổng chi", value: totalAmount, color: "text-green-700" },
        { title: "Đã thu", value: totalReceived, color: "text-blue-600" },
        { title: "Còn lại", value: totalDebt, color: "text-red-600" },
      ].map((card, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-semibold ${card.color}`}>
              {card.value.toLocaleString()} ₫
            </p>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader>
          <CardTitle>Tổng giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{txCount} lượt</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ngày gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{latestDate}</p>
        </CardContent>
      </Card>
    </div>
  );
}
