"use client";
import Sidebar from "@/components/Sidebar";
import QRCard from "@/components/QRCard";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TablesPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [tableCount, setTableCount] = useState<number>(10);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/api/auth/restaurant");
      setRestaurant(data);
    })();
  }, []);

  return (
    <div>
      <Sidebar />
      <main className="ml-60 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Table QR Generator</h2>
          <div>
            <input
              type="number"
              min="1"
              value={tableCount}
              onChange={(e) => setTableCount(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-28 mr-3"
            />
            <span className="text-gray-600">Tables</span>
          </div>
        </div>

        {!restaurant ? (
          <p>Loading restaurant...</p>
        ) : (
          <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: tableCount }).map((_, i) => (
              <QRCard
                key={i}
                restaurantId={restaurant.id}
                tableNumber={i + 1}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
