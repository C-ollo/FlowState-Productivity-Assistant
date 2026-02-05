"use client";

import { Search, Bell } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search Gmail, Slack, or Calendar..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-hover hover:text-text">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-urgent" />
        </button>

        {/* Profile */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
          U
        </button>
      </div>
    </header>
  );
}
