"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
LayoutDashboard,
ShoppingBag,
Package,
Users,
Settings,
LogOut,
Tag,
Search,
ShieldCheck,
} from "lucide-react";
import { logoutAction } from "@/app/actions/logout";

export default function AdminLayout({
children,
}: {
children: React.ReactNode;
}) {
const router = useRouter();
const [loggingOut, setLoggingOut] = useState(false);

const menu = [
{ name: "Dashboard", href: "/admin", icon: LayoutDashboard },
{ name: "Homepage", href: "/admin/homepage", icon: Search },
{ name: "Products", href: "/admin/products", icon: ShoppingBag },
{ name: "Categories", href: "/admin/categories", icon: Tag },
{ name: "Orders", href: "/admin/orders", icon: Package },
{ name: "Customers", href: "/admin/customers", icon: Users },
{ name: "Admins", href: "/admin/admins", icon: ShieldCheck },
{ name: "Settings", href: "/admin/settings", icon: Settings },
];

async function handleLogout() {
if (loggingOut) return;


setLoggingOut(true);

try {
  await logoutAction("admin");
} catch (error) {
  console.error("Logout failed:", error);
} finally {
  router.replace("/");
  router.refresh();
}


}

return ( <div className="flex h-screen overflow-hidden bg-slate-100"> <aside className="flex h-screen w-72 shrink-0 flex-col bg-[#0b120f] text-white"> <div className="shrink-0 border-b border-slate-800 px-7 py-7"> <h1 className="text-[32px] font-bold leading-none tracking-tight"> <span className="text-white">CLO</span> <span className="text-lime-400">SET</span> </h1> <p className="mt-3 text-xs font-semibold tracking-[0.28em] text-slate-500">
ADMIN PANEL </p> </div>


      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="group mb-2 flex items-center gap-4 rounded-xl px-4 py-3.5 text-[16px] font-medium text-slate-300 transition-all duration-200 hover:bg-[#151f1a] hover:text-white"
            >
              <Icon
                size={22}
                strokeWidth={1.8}
                className="text-slate-400 transition-colors group-hover:text-lime-400"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-800 p-5">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-4 py-3.5 text-[16px] font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={20} />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>

    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-24 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-10">
        <div>
          <h2 className="text-[28px] font-bold leading-tight text-slate-900">
            Welcome Back <span className="ml-1">👋</span>
          </h2>
          <p className="mt-1.5 text-[16px] text-slate-500">
            Manage your clothing store.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              size={20}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search anything..."
              className="h-12 w-[310px] rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-5 text-[15px] text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div className="h-9 w-px bg-slate-200" />

          <div className="group flex items-center gap-3 rounded-xl px-2 py-1.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-[16px] font-bold text-white ring-4 ring-slate-100">
              A
            </div>
            <div className="hidden text-left xl:block">
              <p className="text-[14px] font-semibold text-slate-800">
                Administrator
              </p>
              <p className="text-xs text-slate-400">Store Manager</p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-slate-100">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  </div>
);
}
