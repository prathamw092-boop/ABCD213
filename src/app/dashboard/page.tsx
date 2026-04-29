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
import { supabase } from "@/lib/supabase";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis
} from "recharts";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockBlocks, mockActivityLogs, ghostGap, ActivityLog } from "@/mockData";
const HealthBar = ({ totalTarget, totalUsage }: { totalTarget: number; totalUsage: number }) => {
  const percentage = totalTarget > 0 ? Math.min(Math.round((totalUsage / totalTarget) * 100), 100) : 0;

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
const GhostGapGauge = ({ ghostGap }: { ghostGap: number }) => {
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
  const [logs, setLogs] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("water_consumption")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      const formatted = data.map(d => ({
        id: d.id,
        block: `Block ${String.fromCharCode(65 + (d.email.charCodeAt(0) % 6))}`,
        action: `Reported ${d.amount}L usage`,
        units: d.amount,
        timestamp: d.created_at,
        email: d.email
      }));
      setLogs(formatted);
    }
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase.channel('ticker_consumption')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'water_consumption' }, (payload) => {
        if (isPaused) return;
        const d = payload.new;
        const newLog = {
          id: d.id,
          block: `Block ${String.fromCharCode(65 + (d.email.charCodeAt(0) % 6))}`,
          action: `Reported ${d.amount}L usage`,
          units: d.amount,
          timestamp: d.created_at,
          email: d.email
        };
        setLogs(prev => [newLog, ...prev.slice(0, 19)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
                <span className="text-xs text-white/80 font-medium truncate max-w-[150px]" title={log.email}>{log.action}</span>
              </div>
            </div>
            <span className="text-[10px] text-white/30 font-bold tabular-nums">
              {Math.floor((Date.now() - new Date(log.timestamp).getTime()) / 60000)}m ago
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-white/30 text-xs text-center py-4">No recent activity detected.</div>
        )}
      </div>
    </div>
  );
};

// 3. Redistribution Banner
const RedistributionBanner = () => {
  const [stats, setStats] = useState<{ total_redistributed: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from("redistribution_stats").select("*").single();
      if (data) setStats(data);
    };
    fetchStats();
  }, []);

  if (!stats || stats.total_redistributed <= 0) return null;

  return (
    <div className="col-span-full mb-4 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#38bdf8]/10 via-[#38bdf8]/5 to-transparent border border-[#38bdf8]/20 backdrop-blur-md">
      <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
        <div className="flex items-center gap-6 z-10">
          <div className="w-16 h-16 bg-[#38bdf8]/20 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
            <Droplets className="text-[#38bdf8] w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-black text-[#38bdf8] tracking-[0.3em] uppercase mb-2">Community Bonus Active</div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              <span className="metallic-gradient">{stats.total_redistributed}L</span> Shared Today
            </h3>
            <p className="text-white/40 text-[11px] font-medium tracking-tight mt-1">
              Unused water from yesterday's reserves has been redistributed to the ward.
            </p>
          </div>
        </div>
        <Link
          href="/reserves"
          className="px-8 py-4 bg-[#38bdf8] text-[#020617] rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-white transition-all z-10"
        >
          Manage Your Reserve
        </Link>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-full bg-[#38bdf8]/5 rounded-full blur-[60px] translate-x-1/2" />
        <Waves className="absolute bottom-0 right-10 text-white/5 w-32 h-32 -rotate-12 translate-y-1/2" />
      </div>
    </div>
  );
};

// --- Main Page ---

export default function DashboardPage() {
  const container = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ totalTarget: 480, totalUsage: 0, ghostGap: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ data: resData }, { data: consData }] = await Promise.all([
        supabase.from("water_reservations").select("reserved_amount"),
        supabase.from("water_consumption").select("amount")
      ]);
      
      const target = (resData || []).reduce((acc, row) => acc + (row.reserved_amount || 0), 0) || 480;
      const usage = (consData || []).reduce((acc, row) => acc + (row.amount || 0), 0);
      const gap = Math.max(target - usage, 0);
      const gapPercentage = target > 0 ? Math.round((gap / target) * 100) : 0;

      setStats({ totalTarget: target, totalUsage: usage, ghostGap: gapPercentage });
    };
    
    fetchStats();
    
    const channel1 = supabase.channel('dashboard_consumption')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_consumption' }, fetchStats)
      .subscribe();
      
    const channel2 = supabase.channel('dashboard_reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_reservations' }, fetchStats)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, []);

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
    <div ref={container} className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-sans selection:bg-[#38bdf8] selection:text-white">
      {/* Cinematic Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105"
      >
        <source src="/water.mp4" type="video/mp4" />
      </video>
      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/40 to-[#020617]/95 z-0" />

      <div className="relative z-10 pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-1000">
              <h1 className="text-5xl md:text-7xl font-black metallic-gradient tracking-tighter mb-4 filter drop-shadow-[0_10px_30px_rgba(56,189,248,0.2)]">
                WATER PULSE
              </h1>
              <p className="text-white/40 text-sm font-medium tracking-tight max-w-lg leading-relaxed">
                Real-time water accountability for the Kambi Ward community.
                Monitor shared supply levels and identify leaks instantly through our metallic grid.
              </p>
            </div>
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-1000">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-pulse shadow-[0_0_15px_#38bdf8]" />
                <span className="text-[10px] font-black text-[#38bdf8] tracking-[0.3em]">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Redistribution Banner */}
            <RedistributionBanner />

            {/* Health Bar - Full Width Top */}
            <div className="lg:col-span-12 dashboard-card">
              <HealthBar totalTarget={stats.totalTarget} totalUsage={stats.totalUsage} />
            </div>

            {/* Ghost Gap and Ticker Side by Side */}
            <div className="lg:col-span-4 dashboard-card">
              <GhostGapGauge ghostGap={stats.ghostGap} />
            </div>

            <div className="lg:col-span-8 dashboard-card">
              <ActivityTicker />
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="mt-16 flex justify-center dashboard-card">
            <Link
              href="/community"
              className="group flex flex-col items-center gap-4 text-white/40 hover:text-white transition-all duration-500"
            >
              <span className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">Detailed Analytics</span>
              <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#38bdf8] group-hover:bg-[#38bdf8]/10 transition-all duration-500 backdrop-blur-md">
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.2);
        }
        .metallic-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>
    </div>
  );
}
