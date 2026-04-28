"use client";

import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(".nav-item", {
      y: -20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    })
      .from(".social-link", {
        x: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      }, "-=0.4")
      .from(".hero-title span", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
      }, "-=0.6")
      .from(".explore-btn", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.4");
  }, { scope: container });
  return (
    <div ref={container} className="relative min-h-screen w-full overflow-hidden bg-[#0e1611] font-sans selection:bg-[#3a5a40] selection:text-white">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] scale-110 hover:scale-100"
          style={{
            /* Using a high-quality placeholder for a plastic bottle in a stream. 
               Replace with your exact local file path (e.g. '/bottle.jpg') if you have it in the public folder */
            backgroundImage: "url('https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        {/* Cinematic Gradient Overlay (Darker to match murky water vibes) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1611]/60 via-transparent to-[#0e1611]/95" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-12 py-10 w-full">
        <div className="nav-item">
          <button className="text-white hover:text-[#588157] transition-colors duration-300">
            <Menu className="w-8 h-8" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-14 text-[11px] font-bold tracking-[0.25em] text-white/80">
          <Link href="/" className="nav-item hover:text-white transition-colors uppercase">Home</Link>
          <Link href="#" className="nav-item hover:text-white transition-colors uppercase">About</Link>
          <Link href="/dashboard" className="nav-item hover:text-white transition-colors uppercase">Dashboard</Link>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-bold tracking-wider">
          <Link
            href="/dashboard"
            className="nav-item px-8 py-3 bg-[#3a5a40] text-white rounded-full hover:shadow-[0_0_20px_rgba(58,90,64,0.6)] hover:bg-[#4a7251] transition-all duration-300"
          >
            SIGN UP
          </Link>
          <Link
            href="/dashboard"
            className="nav-item text-white/80 hover:text-white transition-colors"
          >
            LOG IN
          </Link>
        </div>
      </nav>

      {/* Vertical Links (Left Sidebar) */}
      <div className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col-reverse gap-28 text-[10px] font-black tracking-[0.4em] text-white/40">
        <a href="#" className="social-link -rotate-90 hover:text-[#588157] transition-colors origin-left whitespace-nowrap">COMMUNITY</a>
        <a href="#" className="social-link -rotate-90 hover:text-[#588157] transition-colors origin-left whitespace-nowrap">IMPACT</a>
        <a href="#" className="social-link -rotate-90 hover:text-[#588157] transition-colors origin-left whitespace-nowrap">ALERTS</a>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
        <div className="hero-title flex flex-col items-center select-none pointer-events-none">
          <span className="text-[14vw] md:text-[10vw] leading-[0.85] font-black text-white tracking-tighter filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            RESOURCE
          </span>
          <span className="text-[12vw] md:text-[9vw] leading-[1.1] font-thin text-stroke tracking-[0.2em] -mt-2 md:-mt-4 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            WATCH
          </span>
        </div>

        <div className="explore-btn mt-20">
          <Link
            href="/dashboard"
            className="group flex flex-col items-center gap-6"
          >
            <div className="px-12 py-4 border border-white/20 rounded-full text-white text-[10px] font-bold tracking-[0.4em] hover:bg-white hover:text-[#0e1611] transition-all duration-500 backdrop-blur-md">
              REPORT WASTE
            </div>
            <div className="relative overflow-hidden h-6 w-5">
              <ChevronDown className="absolute inset-0 w-5 h-5 text-white/60 group-hover:translate-y-full transition-transform duration-500" />
              <ChevronDown className="absolute -inset-y-5 inset-x-0 w-5 h-5 text-white group-hover:translate-y-5 transition-transform duration-500" />
            </div>
          </Link>
        </div>
      </main>

      {/* Bottom Info (Aesthetic detail) */}
      <div className="absolute bottom-10 left-12 z-20 hidden md:block text-white/20 text-[9px] font-bold tracking-[0.2em]">
        <p>@RESOURCEWATCH_COMMUNITY</p>
        <p className="mt-1">ECOLOGICAL ACCOUNTABILITY // 2026</p>
      </div>

      <div className="absolute bottom-10 right-12 z-20 hidden md:block text-white/20 text-[2vw] font-black tracking-widest pointer-events-none">
        2026
      </div>
    </div>
  );
}

