import { DashboardData } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "var(--chart-1)",
  WON: "var(--chart-2)",
  LOST: "var(--chart-3)",
};

const ByStatusBreakdown = ({
  data,
}: {
  data: DashboardData["totalLeadsByStatus"];
}) => {
  const chartConfig = {
    count: {
      label: "Leads",
    },
    OPEN: {
      label: "Open",
      color: "var(--chart-1)",
    },
    WON: {
      label: "Won",
      color: "var(--chart-2)",
    },
    LOST: {
      label: "Lost",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="status" />}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              strokeWidth={4}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] ?? "var(--chart-1)"}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ByStatusBreakdown;
