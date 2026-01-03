"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const items = [
  { href: "/dashboard", label: "Overview" },
  // { href: "/dashboard/orders", label: "Live Orders" },
  // { href: "/dashboard/billing", label: "Live Billing" },
  { href: "/dashboard/live", label: "Live Desk" },
  { href: "/dashboard/menu", label: "Menu" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/tables", label: "Tables" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/upgrade", label: "Upgrade Plan" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Ensure server and first client render output the same HTML
  useEffect(() => setMounted(true), []);

  const list = useMemo(() => {
    const base = "block px-4 py-2 rounded-lg transition";
    return items.map((x) => {
      const active =
        mounted && (pathname === x.href || (x.href !== "/dashboard" && pathname?.startsWith(x.href + "/")));
      return { ...x, cls: active ? `${base} bg-teal-600 text-white` : `${base} hover:bg-gray-100` };
    });
  }, [mounted, pathname]);

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r">
      <div className="p-5 border-b">
        <div className="text-xl font-semibold">CloudMenu</div>
      </div>

      <nav className="p-3 space-y-1">
        {list.map((x) => (
          <Link key={x.href} href={x.href} className={x.cls}>
            {x.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
