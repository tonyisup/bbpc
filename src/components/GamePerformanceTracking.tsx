'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type RouterOutputs } from "@/utils/trpc";

const COLORS = ["#3b82f6", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
const dateLabelFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" });

type PerformanceTrackingOutput = RouterOutputs["season"]["getCurrentPerformanceTracking"];
type PerformancePoint = NonNullable<PerformanceTrackingOutput>["points"][number];
type PerformanceSummaryItem = NonNullable<PerformanceTrackingOutput>["userSummary"][number];

const buildChartData = (points: PerformancePoint[], userSummary: PerformanceSummaryItem[]) => {
  const chartDataPointMap = new Map<string, Record<string, number | string>>();
  const runningTotals: Record<string, number> = {};

  for (const user of userSummary) {
    runningTotals[user.id] = 0;
  }

  for (const point of points) {
    const dateKey = dateLabelFormatter.format(new Date(point.earnedOn));
    const pointValue = Number(point.adjustment ?? 0) + Number(point.gamePointType?.points ?? 0);

    runningTotals[point.userId] = (runningTotals[point.userId] ?? 0) + pointValue;
    chartDataPointMap.set(dateKey, {
      date: dateKey,
      ...runningTotals,
    });
  }

  return Array.from(chartDataPointMap.values());
};

export default function GamePerformanceTracking() {
  const { data, isLoading } = api.season.getCurrentPerformanceTracking.useQuery();

  if (isLoading) {
    return (
      <Card className="border-zinc-800 bg-black/70 text-white shadow-xl">
        <CardContent className="flex h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const chartData = buildChartData(data.points, data.userSummary);

  return (
    <Card className="overflow-hidden border-zinc-800 bg-black/70 text-white shadow-xl shadow-black/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <TrendingUp className="h-5 w-5 text-zinc-200" />
          Performance Tracking
        </CardTitle>
        <CardDescription className="text-base text-zinc-400">
          Cumulative point progression throughout {data.season.title}.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 px-6 text-center text-sm text-zinc-400">
            Point history will appear here once the current season has recorded scoring activity.
          </div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 16, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  {data.userSummary.map((user, index) => (
                    <linearGradient key={user.id} id={`game-performance-${user.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    color: "#fafafa",
                    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.45)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: 700, color: "#fafafa" }}
                  labelStyle={{ color: "#a1a1aa", fontSize: "12px", fontWeight: 600 }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "20px", fontSize: "10px", textTransform: "uppercase", fontWeight: 800 }}
                />
                {data.userSummary.map((user, index) => (
                  <Area
                    key={user.id}
                    type="monotone"
                    dataKey={user.id}
                    name={user.name ?? "Player"}
                    stroke={COLORS[index % COLORS.length]}
                    fill={`url(#game-performance-${user.id})`}
                    fillOpacity={1}
                    strokeWidth={3}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
