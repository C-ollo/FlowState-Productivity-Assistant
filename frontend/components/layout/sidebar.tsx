"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Clock,
  CheckSquare,
  Calendar,
  Settings,
  Zap,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Deadlines", href: "/deadlines", icon: Clock },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

const workspace = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-text">Productivity OS</h1>
          <p className="text-xs text-text-muted">Local-first AI</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Workspace Section */}
        <div className="mt-8">
          <p className="px-3 text-xs font-medium uppercase tracking-wider text-text-muted">
            Workspace
          </p>
          <ul className="mt-2 space-y-1">
            {workspace.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-4">
        {/* Sync Status */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-text-muted">Local-first: Synced</span>
        </div>

        {/* New Task Button */}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>
    </aside>
  );
}
