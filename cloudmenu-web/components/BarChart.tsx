"use client";
import { WeeklySalesPoint } from "@/lib/overview";


export function BarChart({ data }: { data: WeeklySalesPoint[] }) {
const max = Math.max(1, ...data.map(d => d.amount));
return (
<div className="flex items-end gap-4 h-48 px-2">
{data.map((d) => (
<div key={d.day} className="flex flex-col items-center gap-2">
<div
className="w-8 rounded-t bg-teal-500"
style={{ height: `${(d.amount / max) * 160}px` }}
title={`$${d.amount.toFixed(0)}`}
/>
<div className="text-xs text-gray-500">{d.day}</div>
</div>
))}
</div>
);
}