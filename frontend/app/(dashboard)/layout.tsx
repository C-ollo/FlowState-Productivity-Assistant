"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AISidebar } from "@/components/layout/ai-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>
      <AISidebar />
    </div>
  );
}
