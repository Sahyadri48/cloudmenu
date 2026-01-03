// "use client";
// import { useEffect, useState } from "react";
// import { api } from "@/lib/api";
// import { toast } from "sonner";
// import { MenuItemDTO } from "@/lib/types";

// export default function AddItemModal({
//   existingItem,
//   onClose,
//   onCreated,
// }: {
//   existingItem?: MenuItemDTO;
//   onClose: () => void;
//   onCreated: () => void;
// }) {
//   const [form, setForm] = useState<any>({
//     name: "",
//     description: "",
//     currency: "INR",
//     price: 0,
//     discountPrice: 0,
//     prepTime: 15,
//     category: "",
//     kitchenSection: "",
//     status: "AVAILABLE",
//     spiceLevel: "None",
//     dietaryInfo: [],
//     ingredients: "",
//     allergens: "",
//     imageUrl: "",
//   });

//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"];
//   const spiceLevels = ["None", "Mild", "Medium", "Spicy"];
//   const categories = ["Starters", "Main Course", "Desserts", "Beverages"];
//   const sections = ["Grill", "Tandoor", "Bar", "Bakery"];

//   useEffect(() => {
//     if (existingItem) {
//       setForm(existingItem);
//       setPreview(existingItem.imageUrl || null);
//     }
//   }, [existingItem]);

//   const setValue = (key: string, value: any) =>
//     setForm((prev: any) => ({ ...prev, [key]: value }));

//   const uploadImage = async (): Promise<string> => {
//     if (!imageFile) return form.imageUrl || "";
//     const token = localStorage.getItem("jwt");
//     const data = new FormData();
//     data.append("file", imageFile);
//     const res = await api.post("/api/menu/items/upload", data, {
//       headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
//     });
//     return res.data.url;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const restaurantId = Number(localStorage.getItem("restaurantId"));
//       const imageUrl = await uploadImage();
//       const payload = { ...form, imageUrl, restaurantId };

//       const token = localStorage.getItem("jwt");
//       const headers = { Authorization: `Bearer ${token}` };

//       if (existingItem?.id) {
//         await api.put(`/api/menu/items/${existingItem.id}`, payload, { headers });
//         toast.success("Item updated successfully!");
//       } else {
//         await api.post("/api/menu/items", payload, { headers });
//         toast.success("Item added successfully!");
//       }

//       onCreated();
//     } catch (err) {
//       toast.error("Failed to save item");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleDietary = (option: string) => {
//     setForm((prev: any) => {
//       const exists = prev.dietaryInfo.includes(option);
//       return {
//         ...prev,
//         dietaryInfo: exists
//           ? prev.dietaryInfo.filter((x: string) => x !== option)
//           : [...prev.dietaryInfo, option],
//       };
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//       <div className="bg-white rounded-xl p-8 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
//         {/* Header */}
//         <div className="flex justify-between mb-6">
//           <h2 className="text-2xl font-semibold">
//             {existingItem ? "Edit Menu Item" : "Add Menu Item"}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">
//             ✕
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* 🍕 Item Info */}
//           <div>
//             <label className="block font-medium mb-1">Item Name</label>
//             <input
//               value={form.name}
//               onChange={(e) => setValue("name", e.target.value)}
//               className="w-full border rounded-lg px-4 py-2"
//               placeholder="Enter item name"
//               required
//             />
//           </div>

//           <div>
//             <label className="block font-medium mb-1">Description</label>
//             <textarea
//               value={form.description}
//               onChange={(e) => setValue("description", e.target.value)}
//               className="w-full border rounded-lg px-4 py-2"
//               placeholder="Brief description..."
//             />
//           </div>

//           {/* 💰 Currency & Pricing */}
//           <div>
//             <label className="block font-medium mb-2">Currency & Pricing</label>
//             <div className="grid md:grid-cols-4 gap-4">
//               <div>
//                 <label className="text-sm text-gray-600">Currency</label>
//                 <select
//                   value={form.currency}
//                   onChange={(e) => setValue("currency", e.target.value)}
//                   className="border rounded-lg px-4 py-2 w-full"
//                 >
//                   <option value="INR">INR (₹)</option>
//                   <option value="USD">USD ($)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Regular Price</label>
//                 <input
//                   type="number"
//                   placeholder="0.00"
//                   value={form.price}
//                   onChange={(e) => setValue("price", Number(e.target.value))}
//                   className="border rounded-lg px-4 py-2 w-full"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Discount Price</label>
//                 <input
//                   type="number"
//                   placeholder="Optional"
//                   value={form.discountPrice}
//                   onChange={(e) => setValue("discountPrice", Number(e.target.value))}
//                   className="border rounded-lg px-4 py-2 w-full"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Prep Time (min)</label>
//                 <input
//                   type="number"
//                   placeholder="15"
//                   value={form.prepTime}
//                   onChange={(e) => setValue("prepTime", Number(e.target.value))}
//                   className="border rounded-lg px-4 py-2 w-full"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* 🍽️ Category & Kitchen Section */}
//           <div>
//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-sm text-gray-600">Category</label>
//                 <select
//                   value={form.category}
//                   onChange={(e) => setValue("category", e.target.value)}
//                   className="border rounded-lg px-4 py-2 w-full"
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map((c) => (
//                     <option key={c}>{c}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Kitchen Section</label>
//                 <select
//                   value={form.kitchenSection}
//                   onChange={(e) => setValue("kitchenSection", e.target.value)}
//                   className="border rounded-lg px-4 py-2 w-full"
//                 >
//                   <option value="">Select Section</option>
//                   {sections.map((s) => (
//                     <option key={s}>{s}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* 🖼️ Image Upload */}
//           <div>
//             <label className="block font-medium mb-2">Item Image</label>
//             <div className="border-2 border-dashed rounded-lg p-6 text-center">
//               {preview ? (
//                 <img
//                   src={preview}
//                   className="h-32 w-32 object-cover rounded-lg mx-auto mb-3"
//                 />
//               ) : (
//                 <div className="text-gray-400 mb-2 text-2xl font-bold">+</div>
//               )}
//               <label className="bg-teal-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-teal-700">
//                 Upload Image
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) {
//                       setImageFile(file);
//                       setPreview(URL.createObjectURL(file));
//                     }
//                   }}
//                 />
//               </label>
//             </div>
//           </div>

//           {/* 🌶️ Status & Spice Level */}
//           <div>
//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-sm text-gray-600">Status</label>
//                 <select
//                   value={form.status}
//                   onChange={(e) => setValue("status", e.target.value)}
//                   className="border rounded-lg px-4 py-2 w-full"
//                 >
//                   <option value="AVAILABLE">Active</option>
//                   <option value="UNAVAILABLE">Inactive</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm text-gray-600">Spice Level</label>
//                 <select
//                   value={form.spiceLevel}
//                   onChange={(e) => setValue("spiceLevel", e.target.value)}
//                   className="border rounded-lg px-4 py-2 w-full"
//                 >
//                   {spiceLevels.map((s) => (
//                     <option key={s}>{s}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* 🥗 Dietary Info */}
//           <div>
//             <label className="block font-medium mb-2">Dietary Info</label>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//               {dietaryOptions.map((opt) => (
//                 <label key={opt} className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={form.dietaryInfo.includes(opt)}
//                     onChange={() => toggleDietary(opt)}
//                   />
//                   {opt}
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* 🧂 Ingredients & Allergens */}
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="text-sm text-gray-600">Ingredients</label>
//               <input
//                 value={form.ingredients}
//                 onChange={(e) => setValue("ingredients", e.target.value)}
//                 className="border rounded-lg px-4 py-2 w-full"
//                 placeholder="Main ingredients..."
//               />
//             </div>

//             <div>
//               <label className="text-sm text-gray-600">Allergens</label>
//               <input
//                 value={form.allergens}
//                 onChange={(e) => setValue("allergens", e.target.value)}
//                 className="border rounded-lg px-4 py-2 w-full"
//                 placeholder="Allergen information..."
//               />
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="border px-6 py-2 rounded-lg hover:bg-gray-100 transition w-full sm:w-auto"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition w-full sm:w-auto"
//             >
//               {loading ? "Saving..." : existingItem ? "Update Item" : "Add Item"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MenuItemDTO } from "@/lib/types";

type Props = {
  existingItem?: MenuItemDTO;
  onClose: () => void;
  onCreated: () => void;
};

type FormState = {
  name: string;
  description: string;
  currency: "INR" | "USD" | string;
  price: number | "";          // allow "" while typing
  discountPrice: number | "";  // optional numeric
  prepTime: number | "";       // optional numeric
  category: string;
  kitchenSection: string;
  status: "AVAILABLE" | "UNAVAILABLE" | string;
  spiceLevel: string;
  dietaryInfo: string[];
  ingredients: string;
  allergens: string;
  imageUrl: string;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  currency: "INR",
  price: "",
  discountPrice: "",
  prepTime: 15,
  category: "",
  kitchenSection: "",
  status: "AVAILABLE",
  spiceLevel: "None",
  dietaryInfo: [],
  ingredients: "",
  allergens: "",
  imageUrl: "",
};

const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"];
const spiceLevels = ["None", "Mild", "Medium", "Spicy"];
const categories = ["Starters", "Main Course", "Desserts", "Beverages"];
const sections = ["Grill", "Tandoor", "Bar", "Bakery"];

export default function AddItemModal({ existingItem, onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ---------- helpers ----------
  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value ?? ("" as any) }));

  const toNum = (v: number | "" | null | undefined) =>
    v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v);

  const normalizeFromDTO = (dto?: Partial<MenuItemDTO> & Record<string, any>): FormState => ({
    name: dto?.name ?? "",
    description: dto?.description ?? "",
    currency: dto?.currency ?? "INR",
    price: dto?.price ?? "",
    discountPrice: dto?.discountPrice ?? "",
    prepTime: dto?.prepTime ?? 15,
    category: dto?.category ?? "",
    kitchenSection: dto?.kitchenSection ?? "",
    status: dto?.status ?? "AVAILABLE",
    spiceLevel: dto?.spiceLevel ?? "None",
    dietaryInfo: (dto?.dietaryInfo as string[]) ?? [],
    ingredients: dto?.ingredients ?? "",
    allergens: dto?.allergens ?? "",
    imageUrl: dto?.imageUrl ?? "",
  });

  // ---------- effects ----------
  useEffect(() => {
    if (!existingItem) {
      setForm(EMPTY);
      setPreview(null);
      return;
    }
    const normalized = normalizeFromDTO(existingItem);
    setForm(normalized);
    setPreview(normalized.imageUrl || null);
  }, [existingItem]);

  // ---------- upload image ----------
  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.imageUrl || "";
    const data = new FormData();
    data.append("file", imageFile);
    const res = await api.post("/api/menu/items/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // expecting { url: "..." }
    return res.data.url as string;
  };

  // ---------- submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageUrl = await uploadImage();

      // Build clean payload for backend
      const payload = {
        name: String(form.name ?? "").trim(),
        description: (form.description ?? "").trim() || null,
        currency: form.currency || "INR",
        price: toNum(form.price) ?? 0,                 // required? default 0
        discountPrice: toNum(form.discountPrice),      // nullable
        prepTime: toNum(form.prepTime),                // nullable
        category: form.category || null,
        kitchenSection: form.kitchenSection || null,
        status: (form.status as "AVAILABLE" | "UNAVAILABLE") || "AVAILABLE",
        spiceLevel: form.spiceLevel || null,
        dietaryInfo: Array.isArray(form.dietaryInfo) ? form.dietaryInfo : [],
        ingredients: form.ingredients || null,
        allergens: form.allergens || null,
        imageUrl: imageUrl || null,
      };

      if (existingItem?.id) {
        await api.put(`/api/menu/items/${existingItem.id}`, payload);
        toast.success("Item updated successfully!");
      } else {
        await api.post(`/api/menu/items`, payload);
        toast.success("Item added successfully!");
      }

      onCreated();
      onClose();
    } catch (err: any) {
      console.error(err?.response?.data || err);
      toast.error(err?.response?.data?.error || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  const toggleDietary = (option: string) => {
    setForm((prev) => {
      const exists = prev.dietaryInfo.includes(option);
      return {
        ...prev,
        dietaryInfo: exists
          ? prev.dietaryInfo.filter((x) => x !== option)
          : [...prev.dietaryInfo, option],
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-8 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {existingItem ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 🍕 Item Info */}
          <div>
            <label className="block font-medium mb-1">Item Name</label>
            <input
              value={form.name ?? ""}
              onChange={(e) => setValue("name", e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Enter item name"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setValue("description", e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Brief description..."
            />
          </div>

          {/* 💰 Currency & Pricing */}
          <div>
            <label className="block font-medium mb-2">Currency & Pricing</label>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-600">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setValue("currency", e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Regular Price</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.price === "" ? "" : Number(form.price)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setValue("price", v === "" ? "" : Number(v));
                  }}
                  className="border rounded-lg px-4 py-2 w-full"
                  min={0}
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Discount Price</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={form.discountPrice === "" ? "" : Number(form.discountPrice)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setValue("discountPrice", v === "" ? "" : Number(v));
                  }}
                  className="border rounded-lg px-4 py-2 w-full"
                  min={0}
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Prep Time (min)</label>
                <input
                  type="number"
                  placeholder="15"
                  value={form.prepTime === "" ? "" : Number(form.prepTime)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setValue("prepTime", v === "" ? "" : Number(v));
                  }}
                  className="border rounded-lg px-4 py-2 w-full"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* 🍽️ Category & Kitchen Section */}
          <div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Category</label>
                <select
                  value={form.category ?? ""}
                  onChange={(e) => setValue("category", e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Kitchen Section</label>
                <select
                  value={form.kitchenSection ?? ""}
                  onChange={(e) => setValue("kitchenSection", e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full"
                >
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 🖼️ Image Upload */}
          <div>
            <label className="block font-medium mb-2">Item Image</label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {preview ? (
                <img
                  src={preview}
                  className="h-32 w-32 object-cover rounded-lg mx-auto mb-3"
                  alt="Preview"
                />
              ) : (
                <div className="text-gray-400 mb-2 text-2xl font-bold">+</div>
              )}
              <label className="bg-teal-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-teal-700">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    setPreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
              </label>
            </div>
          </div>

          {/* 🌶️ Status & Spice Level */}
          <div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setValue("status", e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full"
                >
                  <option value="AVAILABLE">Active</option>
                  <option value="UNAVAILABLE">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Spice Level</label>
                <select
                  value={form.spiceLevel ?? "None"}
                  onChange={(e) => setValue("spiceLevel", e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full"
                >
                  {spiceLevels.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 🥗 Dietary Info */}
          <div>
            <label className="block font-medium mb-2">Dietary Info</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dietaryOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.dietaryInfo.includes(opt)}
                    onChange={() => {
                      const exists = form.dietaryInfo.includes(opt);
                      setValue(
                        "dietaryInfo",
                        exists
                          ? form.dietaryInfo.filter((x) => x !== opt)
                          : [...form.dietaryInfo, opt]
                      );
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* 🧂 Ingredients & Allergens */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Ingredients</label>
              <input
                value={form.ingredients ?? ""}
                onChange={(e) => setValue("ingredients", e.target.value)}
                className="border rounded-lg px-4 py-2 w-full"
                placeholder="Main ingredients..."
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Allergens</label>
              <input
                value={form.allergens ?? ""}
                onChange={(e) => setValue("allergens", e.target.value)}
                className="border rounded-lg px-4 py-2 w-full"
                placeholder="Allergen information..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="border px-6 py-2 rounded-lg hover:bg-gray-100 transition w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition w-full sm:w-auto"
            >
              {loading ? "Saving..." : existingItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
