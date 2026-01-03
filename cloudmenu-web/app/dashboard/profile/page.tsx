"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar"; // ✅ add sidebar

type HoursRange = { open: string; close: string };
type OperatingHours = {
  monday: HoursRange; tuesday: HoursRange; wednesday: HoursRange;
  thursday: HoursRange; friday: HoursRange; saturday: HoursRange; sunday: HoursRange;
};

type RestaurantProfile = {
  id: number;
  name: string;
  ownerName?: string;
  email: string;
  phone?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  operatingHours: OperatingHours;
  taxRate?: number;
  serviceFee?: number;
  currency?: string;
  deliveryEnabled?: boolean;
  takeoutEnabled?: boolean;
  logoUrl?: string;
};

type QuickStats = {
  menuItems: number;
  activeTables: number;
  totalCustomers: number;
  rating: number;
};

const defaultHours: OperatingHours = {
  monday: { open: "09:00", close: "22:00" },
  tuesday: { open: "09:00", close: "22:00" },
  wednesday: { open: "09:00", close: "22:00" },
  thursday: { open: "09:00", close: "22:00" },
  friday: { open: "10:00", close: "23:00" },
  saturday: { open: "10:00", close: "23:00" },
  sunday: { open: "10:00", close: "21:00" },
};

const days: (keyof OperatingHours)[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday"
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [qrUrl, setQrUrl] = useState<string | null>(null);

  // initial load
  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([
          api.get<RestaurantProfile>("/api/restaurant/profile"),
          api.get<QuickStats>("/api/restaurant/stats"),
        ]);
        setProfile({
          ...p.data,
          operatingHours: p.data.operatingHours ?? defaultHours,
        });
        setStats(s.data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load profile");
      }
    })();
  }, []);

  // load QR png
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/restaurant/qr", { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        setQrUrl(blobUrl);
        return () => URL.revokeObjectURL(blobUrl);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const currencies = useMemo(
    () => [
      { code: "INR", name: "INR - Indian Rupee" },
      { code: "USD", name: "USD - US Dollar" },
      { code: "EUR", name: "EUR - Euro" },
    ],
    []
  );

  const set = <K extends keyof RestaurantProfile>(k: K, v: RestaurantProfile[K]) =>
    setProfile((p) => (p ? ({ ...p, [k]: v } as RestaurantProfile) : p));

  const setHours = (day: keyof OperatingHours, k: keyof HoursRange, v: string) =>
    setProfile((p) =>
      p
        ? ({
            ...p,
            operatingHours: {
              ...p.operatingHours,
              [day]: { ...p.operatingHours[day], [k]: v },
            },
          } as RestaurantProfile)
        : p
    );

  const onLogoChange = (file: File | null) => {
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const uploadLogoIfNeeded = async (): Promise<string | undefined> => {
    if (!logoFile) return profile?.logoUrl || undefined;
    const fd = new FormData();
    fd.append("file", logoFile);
    const res = await api.post<{ url: string }>("/api/restaurant/logo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const logoUrl = await uploadLogoIfNeeded();
      const payload = { ...profile, logoUrl };
      await api.put("/api/restaurant/profile", payload);
      toast.success("Profile saved");
      setProfile((p) => (p ? { ...p, logoUrl } : p));
    } catch (err: any) {
      console.error(err?.response?.data || err);
      toast.error(err?.response?.data?.error || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "menu-qr.png";
    a.click();
  };

  const handlePrintQR = () => {
    if (!qrUrl) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<img src="${qrUrl}" style="width:300px;height:300px;display:block;margin:40px auto;" />`
    );
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  // ----- RENDER -----
  return (
    <div className="flex">
      <Sidebar /> {/* ✅ sidebar shown on this page */}
      {profile ? (
        <main className="ml-60 p-10 bg-gray-50 min-h-screen w-full">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold">Restaurant Profile</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT: 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <section className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField label="Restaurant Name" value={profile.name} onChange={(v)=>set("name", v)} />
                  <TextField label="Owner Name" value={profile.ownerName || ""} onChange={(v)=>set("ownerName", v)} />
                  <TextField label="Email" value={profile.email} onChange={(v)=>set("email", v)} />
                  <TextField label="Phone" value={profile.phone || ""} onChange={(v)=>set("phone", v)} />
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      value={profile.description || ""}
                      onChange={(e)=>set("description", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2"
                      rows={3}
                      placeholder="Short description about your restaurant"
                    />
                  </div>
                </div>
              </section>

              {/* Location & Hours */}
              <section className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4">Location &amp; Hours</h2>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-4">
                    <TextField label="Address" value={profile.address || ""} onChange={(v)=>set("address", v)} placeholder="123 Main Street, Downtown" />
                  </div>
                  <TextField label="City" value={profile.city || ""} onChange={(v)=>set("city", v)} />
                  <TextField label="State" value={profile.state || ""} onChange={(v)=>set("state", v)} />
                  <TextField label="ZIP Code" value={profile.zip || ""} onChange={(v)=>set("zip", v)} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {days.map((d) => (
                    <div key={d} className="flex items-center justify-between gap-3 border rounded-lg px-4 py-2">
                      <div className="capitalize font-medium">{d}</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={profile.operatingHours[d].open}
                          onChange={(e)=>setHours(d, "open", e.target.value)}
                          className="border rounded px-2 py-1"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={profile.operatingHours[d].close}
                          onChange={(e)=>setHours(d, "close", e.target.value)}
                          className="border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment & Settings */}
              <section className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4">Payment &amp; Settings</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <NumberField label="Tax Rate (%)" value={profile.taxRate ?? 0} onChange={(n)=>set("taxRate", n)} step="0.01" />
                  <NumberField label="Service Fee (%)" value={profile.serviceFee ?? 0} onChange={(n)=>set("serviceFee", n)} step="0.01" />
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Currency</label>
                    <select
                      value={profile.currency || "INR"}
                      onChange={(e)=>set("currency", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2"
                    >
                      {currencies.map((c)=>(
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!profile.deliveryEnabled} onChange={(e)=>set("deliveryEnabled", e.target.checked)} />
                    Enable Delivery Service
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!profile.takeoutEnabled} onChange={(e)=>set("takeoutEnabled", e.target.checked)} />
                    Enable Takeout Orders
                  </label>
                </div>
              </section>
            </div>

            {/* RIGHT: 1 col */}
            <div className="space-y-6">
              {/* Logo card */}
              <section className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4">Restaurant Logo</h2>
                <div className="flex flex-col items-center">
                  {logoPreview || profile.logoUrl ? (
                    <img
                      src={logoPreview || profile.logoUrl!}
                      alt="logo"
                      className="h-28 w-28 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-lg bg-gray-100 mb-3" />
                  )}
                  <label className="bg-gray-900 text-white px-4 py-2 rounded cursor-pointer hover:opacity-90">
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e)=>onLogoChange(e.target.files?.[0] || null)}
                    />
                  </label>
                  {logoPreview && (
                    <button onClick={()=>{ setLogoFile(null); setLogoPreview(null); }} className="mt-2 text-sm text-gray-500 hover:underline">
                      Remove selected
                    </button>
                  )}
                </div>
              </section>

              {/* QR card */}
              <section className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4">Menu QR Code</h2>
                <div className="flex flex-col items-center">
                  {qrUrl ? (
                    <img src={qrUrl} alt="QR" className="h-40 w-40 object-contain mb-2" />
                  ) : (
                    <div className="h-40 w-40 bg-gray-100 rounded mb-2" />
                  )}
                  <div className="text-gray-500 text-sm mb-4">Scan to view menu</div>
                  <div className="w-full space-y-2">
                    <button onClick={handleDownloadQR} className="w-full text-center bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                      Download QR
                    </button>
                    <button onClick={handlePrintQR} className="w-full border px-4 py-2 rounded hover:bg-gray-50">
                      Print QR
                    </button>
                  </div>
                </div>
              </section>

              {/* Stats card */}
              <section className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
                {stats ? (
                  <div className="space-y-2 text-sm">
                    <RowStat label="Menu Items" value={stats.menuItems} />
                    <RowStat label="Active Tables" value={stats.activeTables} />
                    <RowStat label="Total Customers" value={stats.totalCustomers.toLocaleString()} />
                    <RowStat label="Rating" value={`★ ${stats.rating.toFixed(1)}`} />
                  </div>
                ) : (
                  <div>Loading…</div>
                )}
              </section>
            </div>
          </div>
        </main>
      ) : (
        // Loading state aligned with sidebar
        <main className="ml-60 p-10 w-full">Loading…</main>
      )}
    </div>
  );
}

/* ---------- small presentational helpers ---------- */

function TextField({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v:string)=>void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-lg px-4 py-2"
      />
    </div>
  );
}

function NumberField({
  label, value, onChange, step="1",
}: { label: string; value: number; onChange: (n:number)=>void; step?: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e)=>onChange(Number(e.target.value))}
        className="w-full border rounded-lg px-4 py-2"
      />
    </div>
  );
}

function RowStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
