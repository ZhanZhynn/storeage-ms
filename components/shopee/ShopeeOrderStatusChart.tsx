"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShopeeOrderStatusChartProps {
  data: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  UNPAID: "#f59e0b",
  READY_TO_SHIP: "#3b82f6",
  PROCESSED: "#8b5cf6",
  SHIPPED: "#6366f1",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
  INVOICE_PENDING: "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  UNPAID: "Unpaid",
  READY_TO_SHIP: "Ready to Ship",
  PROCESSED: "Processed",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  INVOICE_PENDING: "Invoice Pending",
};

export default function ShopeeOrderStatusChart({ data }: ShopeeOrderStatusChartProps) {
  const chartData = Object.entries(data)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || "#6b7280",
    }))
    .filter((d) => d.value > 0);

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Orders by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No order data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${Number(value)} orders`, "Count"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
