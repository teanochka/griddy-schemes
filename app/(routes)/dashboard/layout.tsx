'use client'

import { ReactNode } from "react";
import { Header } from "./_components/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Header />
      <main className="mt-6">
        {children}
      </main>
    </div>
  );
}
