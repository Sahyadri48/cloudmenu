import { OrderDTO } from "@/lib/types";
export default function OrderCard({ o }: { o: OrderDTO }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">Order #{o.orderNumber ?? o.id}</div>
          <div className="text-sm text-gray-500">Table {o.tableNumber}</div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700">{o.status}</span>
      </div>
      <div className="mt-3 space-y-1 text-sm">
        {o.items?.map((it, i) => (
          <div key={i} className="flex justify-between">
            <span>{it.quantity}× {it.name ?? it.menuItemId}</span>
            <span>₹{(it.basePrice ?? 0) * (it.quantity ?? 0)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 font-semibold">₹{o.totalAmount}</div>
    </div>
  );
}
