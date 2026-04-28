"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Coins, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Community", href: "/community", icon: Users },
  { name: "Credits", href: "/credits", icon: Coins },
  { name: "Alerts", href: "/alerts", icon: Bell },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar (Tablet/Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 z-20">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-emerald-400 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold">R</div>
            ResourceWatch
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={twMerge(
                  clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-emerald-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                  )
                )}
              >
                <item.icon className={clsx("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-100">Kambi Ward</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400 tracking-wide">LIVE</span>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
            {time || "..."}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8" id="scroll-container">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe z-50">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={twMerge(
                  clsx(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[64px]",
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-400 hover:text-slate-200"
                  )
                )}
              >
                <div
                  className={twMerge(
                    clsx(
                      "p-1.5 rounded-lg transition-colors duration-300",
                      isActive ? "bg-emerald-500/15 border border-emerald-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" : "transparent"
                    )
                  )}
                >
                  <item.icon className={clsx("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
