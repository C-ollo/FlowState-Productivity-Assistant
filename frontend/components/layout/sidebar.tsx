"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-auth";
import { useInboxStats } from "@/hooks/use-items";

const navigation = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Inbox", href: "/inbox", icon: "inbox", showBadge: true },
  { name: "My Tasks", href: "/tasks", icon: "task_alt" },
  { name: "Deadlines", href: "/deadlines", icon: "calendar_month" },
  { name: "Settings", href: "/settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const { data: stats } = useInboxStats();
  const unreadCount = stats?.unread_count ?? 0;

  return (
    <aside className="w-20 lg:w-64 flex flex-col border-r border-slate-800 bg-[#0c0c1a] h-screen transition-all duration-300 z-20 flex-shrink-0">
      {/* Logo */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800/50">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow flex-shrink-0">
          <span className="material-symbols-outlined text-white">auto_awesome</span>
        </div>
        <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight text-white">
          Flow<span className="text-primary">State</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-3 rounded-xl transition-colors group relative overflow-hidden ${
                isActive
                  ? "bg-primary/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <span
                className={`material-symbols-outlined relative z-10 transition-colors ${
                  isActive ? "text-primary" : "group-hover:text-primary"
                }`}
              >
                {item.icon}
              </span>
              <span className="hidden lg:block ml-3 font-medium relative z-10">
                {item.name}
              </span>
              {item.showBadge && unreadCount > 0 && (
                <span className="hidden lg:flex ml-auto bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full relative z-10">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center w-full p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="hidden lg:block ml-3 text-left">
            <p className="text-sm font-semibold text-white leading-none">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
