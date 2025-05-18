import TopDebtChart from "./TopDebtChart";
import RevenuePieChart from "./RevenuePieChart";
import { Card } from "@/components/ui/card";

export default function ChartSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
        <TopDebtChart />
      </Card>
      <Card>
        <RevenuePieChart />
      </Card>
    </div>
  );
}
