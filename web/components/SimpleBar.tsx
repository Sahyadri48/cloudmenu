"use client";

type Point = { label: string; value: number };

const WEEK_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isWeekLabelSet(labels: string[]) {
  // All labels are in the weekday set
  return labels.every(l => WEEK_ORDER.includes(l));
}

export default function SimpleBar({ data }: { data: Point[] }) {
  // If the labels look like weekdays, sort them to Sun→Sat
  const normalized: Point[] = (() => {
    const labels = data.map(d => d.label);
    if (!isWeekLabelSet(labels)) return data;
    const orderIdx = new Map(WEEK_ORDER.map((d, i) => [d, i]));
    return [...data].sort((a, b) => (orderIdx.get(a.label)! - orderIdx.get(b.label)!));
  })();

  const max = Math.max(1, ...normalized.map(d => d.value));

  return (
    <div className="w-full h-60 flex items-end gap-3 px-4 pb-4">
      {normalized.map((p, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className="w-full rounded-t bg-emerald-600/90"
            style={{ height: `${(p.value / max) * 100}%` }}
            title={`${p.label}: ${p.value.toFixed(2)}`}
          />
          <div className="mt-2 text-xs text-gray-500">{p.label}</div>
        </div>
      ))}
    </div>
  );
}
