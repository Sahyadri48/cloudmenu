// "use client";
// import Sidebar from "@/components/Sidebar";
// import AddItemForm from "@/components/AddItemForm";
// import { api } from "@/lib/api";
// import { useEffect, useState } from "react";
// import { MenuItemDTO } from "@/lib/types";

// export default function MenuPage() {
//   const [items, setItems] = useState<MenuItemDTO[]>([]);
//   const restaurantId = typeof window !== "undefined" ? Number(localStorage.getItem("restaurantId")) : undefined;

//   const load = async () => {
//     const { data } = await api.get("/api/menu/items", { params:{ restaurantId } });
//     setItems(data);
//   };

//   useEffect(()=>{ if(restaurantId) load(); },[restaurantId]);

//   const removeItem = async (id?: number) => {
//     if (!id) return;
//     await api.delete(`/api/menu/items/${id}`);
//     setItems(prev => prev.filter(x => x.id !== id));
//   };

//   return (
//     <div>
//       <Sidebar />
//       <main className="ml-60 p-8 space-y-6">
//         <h2 className="text-2xl font-semibold">Menu</h2>
//         <AddItemForm onCreated={load} />
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {items.map(it=>(
//             <div key={it.id} className="bg-white border rounded-xl p-6">
//               <h3 className="font-semibold">{it.name}</h3>
//               <p className="text-sm text-gray-500">{it.description}</p>
//               <div className="flex justify-between mt-4">
//                 <span className="font-semibold">₹{it.price}</span>
//                 <button onClick={()=>removeItem(it.id)} className="text-red-600">Delete</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }


"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { MenuItemDTO } from "@/lib/types";
import AddItemModal from "@/components/AddItemForm";
import { useRouter, useSearchParams } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();
  const search = useSearchParams();

  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItemDTO | null>(null);
  const [showModal, setShowModal] = useState(false);

  const restaurantId =
    typeof window !== "undefined" ? Number(localStorage.getItem("restaurantId")) : undefined;

  const loadItems = useCallback(async () => {
    if (!restaurantId) return;
    const { data } = await api.get<MenuItemDTO[]>("/api/menu/items", {
      params: { restaurantId },
    });
    setItems(data ?? []);
  }, [restaurantId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Open modal for ?edit=ID
  useEffect(() => {
    const idStr = search.get("edit");
    if (!idStr) return; // nothing to do

    // load the single item and open the modal
    (async () => {
      try {
        const { data } = await api.get<MenuItemDTO>(`/api/menu/items/${idStr}`);
        setEditingItem(data);
        setShowModal(true);
      } catch (e) {
        console.error("Failed to load item", e);
        alert("Failed to load item for editing.");
        // remove the bad query param
        router.replace("/dashboard/menu");
      }
    })();
  }, [search, router]);

  // Close modal AND clear ?edit=
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    router.replace("/dashboard/menu"); // clears the query param
  };

  const handleRefresh = async () => {
    await loadItems();
    closeModal();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await api.delete(`/api/menu/items/${id}`);
    await loadItems();
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-10 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Menu</h1>
          <button
            className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700"
            onClick={() => setShowModal(true)}
          >
            Add Item
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="h-40 w-full bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-500 text-sm">{item.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="font-semibold text-teal-700 text-lg">₹{item.price}</span>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setEditingItem(item);   // open with current card without refetch if you like
                      setShowModal(true);
                      // also sync the URL so Overview link behavior matches manual clicks
                      router.replace(`/dashboard/menu?edit=${item.id}`);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit Modal */}
        {showModal && (
          <AddItemModal
            existingItem={editingItem || undefined}
            onClose={closeModal}
            onCreated={handleRefresh}
          />
        )}
      </main>
    </div>
  );
}
