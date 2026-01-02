"use client";


export default function Topbar({ userName }: { userName?: string | null }) {
const router = useRouter();


async function onLogout() {
try {
await logoutApi();
} finally {
// clear token locally
if (typeof window !== "undefined") localStorage.removeItem("token");
router.replace("/login");
}
}


const initials = (userName || "?").trim().charAt(0).toUpperCase();


return (
<div className="sticky top-0 z-20 bg-gray-50/70 backdrop-blur border-b">
<div className="h-14 flex items-center justify-between px-6">
<div className="text-xl font-semibold">CloudMenu</div>
<div className="flex items-center gap-3">
<div className="hidden md:flex text-sm text-gray-600">{userName}</div>
<div className="w-8 h-8 rounded-full bg-teal-600 text-white grid place-items-center text-sm font-medium">
{initials}
</div>
<button
onClick={onLogout}
className="text-sm px-3 py-1.5 rounded-lg border hover:bg-white"
aria-label="Log out"
>
Log Out
</button>
</div>
</div>
</div>
);
}