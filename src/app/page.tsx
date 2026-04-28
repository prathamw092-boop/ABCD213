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
    <div ref={container} className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-sans selection:bg-[#38bdf8] selection:text-white">
      {/* Cinematic Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105"
      >
        {/* High-quality cinematic stream video */}
        <source src="/water.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Cinematic Gradient Overlay (Deep Metallic Blues) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-transparent to-[#020617]/95" />
      <div className="absolute inset-0 bg-[#020617]/40" />
      <div className="h-20 w-full" /> {/* Spacer for fixed Navbar */}
      {/* Vertical Links Removed - Handled by Top Nav */}
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
        <div className="hero-title flex flex-col items-center select-none pointer-events-none">
          <span className="text-[14vw] md:text-[10vw] leading-[0.85] font-black metallic-gradient tracking-tighter filter drop-shadow-[0_10px_30px_rgba(56,189,248,0.3)]">
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
            <div className="px-12 py-4 border border-white/20 rounded-full text-white text-[10px] font-bold tracking-[0.4em] hover:bg-[#38bdf8] hover:text-[#020617] hover:border-[#38bdf8] transition-all duration-500 backdrop-blur-md">
              REPORT WASTE
            </div>
            <div className="relative overflow-hidden h-6 w-5">
              <ChevronDown className="absolute inset-0 w-5 h-5 text-white/60 group-hover:translate-y-full transition-transform duration-500" />
              <ChevronDown className="absolute -inset-y-5 inset-x-0 w-5 h-5 text-white group-hover:translate-y-5 transition-transform duration-500" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
} 