"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Info,
  Pause,
  Play,
  AlertCircle,
  ChevronRight,
  Droplets,
  Waves,
  Filter
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis
} from "recharts";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockBlocks, mockActivityLogs, ghostGap, ActivityLog } from "@/mockData";
const HealthBar = () => {
  const totalTarget = mockBlocks.length * 80;
  const totalUsage = mockBlocks.reduce((acc, block) => acc + block.currentUsage, 0);
  const percentage = Math.min(Math.round((totalUsage / totalTarget) * 100), 100);

  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(barRef.current,
      { width: "0%" },
      { width: `${percentage}%`, duration: 1.5, ease: "power2.out" }
    );
  }, [percentage]);

  const getColor = (p: number) => {
    if (p < 60) return "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]";
    if (p < 85) return "bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]";
    return "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]";
  };

  return (
    <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase">Water Supply Health</h2>
        <span className="text-white/40 text-[10px] font-medium tracking-wider">LIVE STATUS</span>
      </div>

      <div className="relative h-24 w-full bg-black/40 rounded-xl overflow-hidden border border-white/5">
        <div
          ref={barRef}
          className={`h-full transition-colors duration-500 ${getColor(percentage)}`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-white/80 font-bold text-sm tracking-tight">{totalUsage}</span>
        <span className="text-white/40 text-xs">liters used of</span>
        <span className="text-white/80 font-bold text-sm tracking-tight">{totalTarget}</span>
        <span className="text-white/40 text-xs uppercase tracking-widest font-medium ml-1">total capacity</span>
      </div>
    </div>
  );
};

// 2. Ghost Gap Gauge
const GhostGapGauge = () => {
  const data = [{ value: ghostGap }];

  const getStatus = (gap: number) => {
    if (gap < 10) return { color: "#22d3ee", label: "Reporting is on track", alert: false };
    if (gap <= 25) return { color: "#38bdf8", label: "Some under-reporting detected", alert: false };
    return { color: "#818cf8", label: "Critical gap — check meters", alert: true };
  };

  const status = getStatus(ghostGap);

  return (
    <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center">
      <div className="w-full flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase">Water Ghost Gap</h2>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-white/20 hover:text-white/60 cursor-help transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-[10px] text-white/80 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
              The Ghost Gap measures the discrepancy between expected water supply and manual community reports.
            </div>
          </div>
        </div>
        {status.alert && (
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        )}
      </div>

      <div className="h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={90}
            endAngle={90 - (3.6 * Math.min(ghostGap, 100))}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
              fill={status.color}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white">{ghostGap}</span>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Gap Score</span>
        </div>
      </div>

      <p className="mt-2 text-xs font-bold text-center tracking-tight" style={{ color: status.color }}>
        {status.label}
      </p>
    </div>
  );
};

// 3. Live Activity Feed (The Ticker)
const ActivityTicker = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        block: `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
        action: ["Water drawn", "Tank filled", "Filter replaced", "Leak reported", "Valve adjusted"][Math.floor(Math.random() * 5)],
        units: Math.floor(Math.random() * 50) + 1,
        timestamp: new Date().toISOString(),
      };

      setLogs(prev => [newLog, ...prev.slice(0, 19)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getIcon = (action: string) => {
    if (action.includes("Leak")) return <AlertCircle className="w-3 h-3 text-cyan-400" />;
    if (action.includes("Filter")) return <Filter className="w-3 h-3 text-silver-400" />;
    if (action.includes("Tank")) return <Waves className="w-3 h-3 text-blue-400" />;
    return <Droplets className="w-3 h-3 text-sky-400" />;
  };

  return (
    <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase">Live Activity</h2>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {isPaused ? "RESUME" : "PAUSE FEED"}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 max-h-[320px] overflow-y-auto space-y-3 pr-2 custom-scrollbar"
      >
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group animate-in fade-in slide-in-from-top-4 duration-500"
          >
            <div className="flex items-center gap-3">
              <Link
                href={`/community?block=${log.block.split(" ")[1]}`}
                className="px-2 py-0.5 rounded bg-[#334155] text-white text-[9px] font-black tracking-widest hover:bg-[#475569] transition-colors"
              >
                {log.block}
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-white/30">{getIcon(log.action)}</span>
                <span className="text-xs text-white/80 font-medium">{log.action}</span>
              </div>
            </div>
            <span className="text-[10px] text-white/30 font-bold tabular-nums">
              {Math.floor((Date.now() - new Date(log.timestamp).getTime()) / 60000)}m ago
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Page ---

export default function DashboardPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".dashboard-card", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out"
    });
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#020617] pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Water Pulse</h1>
            <p className="text-white/40 text-sm font-medium tracking-tight max-w-lg">
              Real-time water accountability for the Kambi Ward community.
              Monitor shared supply levels and identify leaks instantly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/20">
              <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
              <span className="text-[10px] font-black text-[#38bdf8] tracking-widest">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Health Bar - Full Width Top */}
          <div className="lg:col-span-12 dashboard-card">
            <HealthBar />
          </div>

          {/* Ghost Gap and Ticker Side by Side */}
          <div className="lg:col-span-4 dashboard-card">
            <GhostGapGauge />
          </div>

          <div className="lg:col-span-8 dashboard-card">
            <ActivityTicker />
          </div>
        </div>

        {/* Floating Action Button (Optional Aesthetic Detail) */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/community"
            className="group flex items-center gap-4 text-white/40 hover:text-white transition-all duration-300"
          >
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Detailed Analytics</span>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
