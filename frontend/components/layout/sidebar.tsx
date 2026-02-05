"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/inbox", icon: "dashboard" },
  { name: "Deadlines", href: "/deadlines", icon: "timer" },
  { name: "Messages", href: "/messages", icon: "chat_bubble" },
  { name: "Calendar", href: "/calendar", icon: "calendar_today" },
  { name: "Settings", href: "/settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border-dark flex flex-col justify-between bg-background-dark p-4">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">bolt</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold leading-none">
              Productivity OS
            </h1>
            <p className="text-text-muted text-xs font-medium">Local-first AI</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-border-dark text-white"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <p className="text-sm font-medium">{item.name}</p>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4">
        {/* Sync Status */}
        <div className="bg-surface-dark p-3 rounded-xl border border-border-dark">
          <p className="text-xs text-text-muted mb-2 uppercase font-bold tracking-wider">
            Sync Status
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
            </span>
            <span className="text-[10px] text-text-muted">2m ago</span>
          </div>
        </div>

        {/* New Task Button */}
        <button className="w-full bg-primary hover:bg-blue-600 transition-colors text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span> New Task
        </button>
      </div>
    </aside>
  );
}
