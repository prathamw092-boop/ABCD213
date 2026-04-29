"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export const Navbar = () => {
  const pathname = usePathname();
  
  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "LEDGER", href: "/ledger" },
    { name: "RESERVES", href: "/reserves" },
    { name: "COMMUNITY", href: "/community" },
    { name: "EXCHANGE", href: "/exchange" },
  ];

  const { user } = useAuth();

  const handleLogout = async () => {
    localStorage.removeItem("resource_watch_mock_user");
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 py-8 bg-gradient-to-b from-[#020617]/80 to-transparent backdrop-blur-[2px] pointer-events-none">
      <div className="flex items-center gap-6 pointer-events-auto">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="text-white font-black tracking-tighter text-xl group-hover:text-[#38bdf8] transition-colors duration-300">RESOURCE</span>
          <span className="metallic-gradient text-sm font-black tracking-widest transition-opacity duration-300">WATCH</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center justify-center flex-1 gap-14 text-[10px] font-black tracking-[0.4em] text-white/40 pointer-events-auto">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`hover:text-white transition-all duration-300 relative group py-2 ${
              pathname === link.href ? "text-white" : ""
            }`}
          >
            {link.name}
            <span className={`absolute bottom-0 left-0 h-[1px] bg-[#38bdf8] transition-all duration-500 group-hover:w-full ${
              pathname === link.href ? "w-full" : "w-0"
            }`} />
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6 pointer-events-auto">
        {user ? (
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full text-[10px] font-black tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300 uppercase"
          >
            LOG OUT
          </button>
        ) : (
          <Link
            href="/login"
            className="px-8 py-3 bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-white rounded-full text-[10px] font-black tracking-widest hover:bg-[#38bdf8] hover:text-[#020617] transition-all duration-300 uppercase"
          >
            LOG IN
          </Link>
        )}
        <button className="md:hidden text-white">
          <Menu className="w-8 h-8" />
        </button>
      </div>
    </nav>
  );
};
