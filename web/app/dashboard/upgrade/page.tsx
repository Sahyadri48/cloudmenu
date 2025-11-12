// "use client";

// import { useEffect, useState } from "react";
// import Sidebar from "@/components/Sidebar";
// import { api } from "@/lib/api";
// import { useCurrency } from "@/lib/currency";
// import ToggleCurrency from "@/components/CurrencyToggle";
// import { CurrencyProvider } from "@/lib/currency";

// type BackendPlan = {
//   code: "FREE" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE";
//   name: string;
//   pricePerMonth: number; // USD from backend
//   features: string[];
// };
// type UsageStats = {
//   menuItems: number;
//   monthlyOrders: number;
//   totalCustomers: number;
//   storageBytes: number;
//   currentPlan: string;
// };

// const SUBTITLES = {
//   FREE: "Perfect for trying out",
//   BASIC: "Perfect for getting started",
//   PROFESSIONAL: "For growing restaurants",
//   ENTERPRISE: "For restaurant chains",
// } as const;

// export default function UpgradePage() {
//   const { currency, convertFromUSD, money } = useCurrency();
//   const [usage, setUsage] = useState<UsageStats | null>(null);
//   const [plans, setPlans] = useState<BackendPlan[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const [u, p] = await Promise.all([
//           api.get<UsageStats>("/api/billing/usage"),
//           api.get<BackendPlan[]>("/api/billing/plans"),
//         ]);
//         setUsage(u.data);
//         setPlans(p.data);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const handleUpgrade = async (plan: BackendPlan["code"]) => {
//     await api.post("/api/billing/upgrade", { plan });
//     const [u, p] = await Promise.all([
//       api.get<UsageStats>("/api/billing/usage"),
//       api.get<BackendPlan[]>("/api/billing/plans"),
//     ]);
//     setUsage(u.data);
//     setPlans(p.data);
//   };

//   if (loading) {
//     return (
//       <div className="flex">
//         <Sidebar />
//         <main className="ml-60 p-8 w-full">Loading…</main>
//       </div>
//     );
//   }

//   const current = (usage?.currentPlan || "").toUpperCase();

//   return (
//     <div className="flex">
//       <Sidebar />
//       <main className="ml-60 p-8 w-full space-y-8">
//         {/* Header row with perfect right alignment for the toggle */}
//         <div className="flex items-center justify-between">
//           <h1 className="text-2xl font-semibold">Choose Your Premium Packs</h1>
//           <div className="flex items-center gap-3">
//             {/* small inline toggle */}
//             <ToggleCurrency value={currency} onChange={() => { /* handled in currency page or useCurrency setter here if you prefer */ }} className="hidden sm:block" />
//             <a
//               href="/dashboard/currency"
//               className="text-sm text-teal-700 hover:underline"
//             >
//               Currency settings
//             </a>
//           </div>
//         </div>

//         {/* Usage */}
//         {usage && (
//           <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-teal-50 p-6 rounded-xl">
//             <Stat label="Menu Items" value={usage.menuItems} />
//             <Stat label="Monthly Orders" value={usage.monthlyOrders} />
//             <Stat label="Total Customers" value={usage.totalCustomers} />
//             <Stat
//               label="Storage Used"
//               value={`${(usage.storageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`}
//             />
//           </section>
//         )}

//         {/* Plans */}
//         <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//           {plans.map((card) => {
//             const price = convertFromUSD(card.pricePerMonth || 0);
//             const isCurrent = current === card.code;
//             return (
//               <div
//                 key={card.code}
//                 className={`rounded-2xl border p-6 bg-white shadow-sm ${isCurrent ? "ring-2 ring-teal-500" : ""}`}
//               >
//                 <div className="flex items-baseline justify-between">
//                   <h3 className="text-lg font-semibold">{card.name}</h3>
//                   {isCurrent && (
//                     <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
//                       Current
//                     </span>
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">{SUBTITLES[card.code]}</p>
//                 <div className="mt-4">
//                   <span className="text-3xl font-bold">{money(price)}</span>
//                   <span className="text-gray-500">/mo</span>
//                 </div>
//                 <ul className="mt-4 space-y-2 text-sm text-gray-700">
//                   {(card.features || []).map((f, i) => (
//                     <li key={`${card.code}-${i}`} className="flex gap-2">
//                       <span>✓</span>
//                       <span>{f}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <button
//                   disabled={isCurrent}
//                   onClick={() => handleUpgrade(card.code)}
//                   className={`mt-6 w-full rounded-lg px-4 py-2 ${
//                     isCurrent
//                       ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                       : "bg-teal-600 text-white hover:bg-teal-700"
//                   }`}
//                 >
//                   {isCurrent ? "Current Plan" : `Upgrade to ${card.name}`}
//                 </button>
//               </div>
//             );
//           })}
//         </section>
//       </main>
//     </div>
//   );
// }

// function Stat({ label, value }: { label: string; value: string | number }) {
//   return (
//     <div className="rounded-xl bg-white p-4 shadow-sm border">
//       <div className="text-sm text-gray-500">{label}</div>
//       <div className="text-2xl font-semibold mt-1">{value}</div>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import CurrencyToggle, { type Currency } from "@/components/CurrencyToggle";

/** ----- Types ----- */
// What the backend actually sends:
type BackendPlan = {
  code: "FREE" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE";
  name: string;              // title on the card
  pricePerMonth: number;     // USD number
  features: string[];
};

// What the UI component expects:
type PlanCard = {
  code: BackendPlan["code"];
  title: string;
  subtitle: string;
  price: number;
  priceUnit: string;
  features: string[];
  isCurrent: boolean;
};

type UsageStats = {
  menuItems: number;
  monthlyOrders: number;
  totalCustomers: number;
  storageBytes: number;
  currentPlan: BackendPlan["code"];
};

const SUBTITLES: Record<BackendPlan["code"], string> = {
  FREE: "Perfect for trying out",
  BASIC: "Perfect for getting started",
  PROFESSIONAL: "For growing restaurants",
  ENTERPRISE: "For restaurant chains",
};

/** Map backend shape -> UI shape */
function transformPlans(
  backend: BackendPlan[],
  currentPlan: BackendPlan["code"]
): PlanCard[] {
  return backend.map((p) => ({
    code: p.code,
    title: p.name,
    subtitle: SUBTITLES[p.code],
    price: Number(p.pricePerMonth) || 0, // guard against bad data
    priceUnit: "mo",
    features: p.features ?? [],
    isCurrent: p.code === currentPlan,
  }));
}

export default function UpgradePage() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>("USD");

  // 1 USD -> INR (env or fallback)
  const inrPerUsd = useMemo(() => {
    const env = Number(process.env.NEXT_PUBLIC_INR_PER_USD);
    return Number.isFinite(env) && env > 0 ? env : 83;
  }, []);

  /** Format price safely */
  const formatPrice = (usd?: number) => {
    const n = Number(usd);
    if (!Number.isFinite(n)) return currency === "USD" ? "$0" : "₹0";
    if (currency === "USD") return `$${n}`;
    const inr = Math.round(n * inrPerUsd);
    return `₹${inr.toLocaleString("en-IN")}`;
  };

  /** Load usage + plans and normalize */
  async function load() {
    const [uRes, pRes] = await Promise.all([
      api.get<UsageStats>("/api/billing/usage"),
      api.get<BackendPlan[]>("/api/billing/plans"),
    ]);
    const u = uRes.data;
    setUsage(u);
    setPlans(transformPlans(pRes.data, u.currentPlan));
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Don’t let user “upgrade” to the already-current plan */
  const handleUpgrade = async (plan: BackendPlan["code"], isCurrent: boolean) => {
    if (isCurrent) return; // extra safety; disabled button should already prevent this
    await api.post("/api/billing/upgrade", { plan });
    await load(); // refetch & remap after upgrade
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="ml-60 p-8 w-full">Loading…</main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 p-8 w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-semibold">Choose Your Premium Packs</h1>
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>

        {/* Usage summary */}
        {usage && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-teal-50 p-6 rounded-xl">
            <Stat label="Menu Items" value={usage.menuItems} />
            <Stat label="Monthly Orders" value={usage.monthlyOrders} />
            <Stat label="Total Customers" value={usage.totalCustomers} />
            <Stat
              label="Storage Used"
              value={`${(usage.storageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`}
            />
          </section>
        )}

        {/* Plans */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((card) => (
            <div
              key={card.code}
              className={`rounded-2xl border p-6 bg-white shadow-sm transition ${
                card.isCurrent ? "ring-2 ring-teal-500" : "hover:shadow-md"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">{card.title}</h3>
                {card.isCurrent && (
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                    Current
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold">{formatPrice(card.price)}</span>
                <span className="text-gray-500">/{card.priceUnit}</span>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {card.features.map((f, i) => (
                  <li key={`${card.code}-${i}`} className="flex gap-2">
                    <span>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={card.isCurrent}
                onClick={() => handleUpgrade(card.code, card.isCurrent)}
                className={`mt-6 w-full rounded-lg px-4 py-2 ${
                  card.isCurrent
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {card.isCurrent ? "Current Plan" : `Upgrade to ${card.title}`}
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
