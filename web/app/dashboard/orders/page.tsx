"use client";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import OrderCard from "@/components/OrderCard";
import { OrderDTO } from "@/lib/types";

export default function Orders() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const load = async () => {
    const { data } = await api.get("/api/orders", { params: { status: "NEW" } });
    setOrders(data);
  };
  useEffect(()=>{ load(); const id=setInterval(load,5000); return ()=>clearInterval(id); },[]);
  return (
    <div>
      <Sidebar />
      <main className="ml-60 p-8">
        <h2 className="text-2xl font-semibold mb-6">Live Orders</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map(o => <OrderCard key={o.id} o={o} />)}
        </div>
      </main>
    </div>
  );
}
