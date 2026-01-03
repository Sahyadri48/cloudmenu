"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/api/auth/restaurant");
        setRestaurant(data);
      } catch (e: any) {
        setErr("Failed to load restaurant profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const set = (k: string, v: any) => setRestaurant((p: any) => ({ ...p, [k]: v }));

  async function saveChanges(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await api.put("/api/auth/restaurant", {
        logoUrl: restaurant.logoUrl,
        primaryColor: restaurant.primaryColor,
        secondaryColor: restaurant.secondaryColor,
      });
      setMsg("Profile updated successfully!");
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to save changes");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      <form onSubmit={saveChanges} className="bg-white rounded-xl border p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Restaurant Name</label>
          <input
            disabled
            className="border rounded-lg px-4 py-3 w-full bg-gray-100"
            value={restaurant.name}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            disabled
            className="border rounded-lg px-4 py-3 w-full bg-gray-100"
            value={restaurant.email}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input
            type="text"
            className="border rounded-lg px-4 py-3 w-full"
            placeholder="https://example.com/logo.png"
            value={restaurant.logoUrl || ""}
            onChange={(e) => set("logoUrl", e.target.value)}
          />
          {restaurant.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt="Logo preview"
              className="mt-3 w-24 h-24 object-contain border rounded-lg"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <input
              type="color"
              className="border rounded-lg w-full h-12"
              value={restaurant.primaryColor || "#0f766e"}
              onChange={(e) => set("primaryColor", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secondary Color</label>
            <input
              type="color"
              className="border rounded-lg w-full h-12"
              value={restaurant.secondaryColor || "#e0f2f1"}
              onChange={(e) => set("secondaryColor", e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg"
        >
          Save Changes
        </button>

        {msg && <p className="text-green-600 text-sm mt-2">{msg}</p>}
        {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
      </form>
    </div>
  );
}

