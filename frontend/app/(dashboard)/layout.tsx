"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { AISidebar } from "@/components/layout/ai-sidebar";

// Pages that use wide layouts (kanban boards, etc.) and don't need the AI sidebar
const widePages = ["/deadlines"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showAISidebar = !widePages.includes(pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>
      {showAISidebar && <AISidebar />}
    </div>
  );
}
