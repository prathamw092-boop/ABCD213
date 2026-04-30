"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  TrendingUp,
  Map as MapIcon,
  Info,
  ChevronRight,
  Droplets,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { mockBlocks, BlockData } from "@/mockData";
import { supabase } from "@/lib/supabase";

// --- Mock Data for 7-Day Trend ---
const trendData = [
  { day: "Mon", actual: 420, target: 480 },
  { day: "Tue", actual: 450, target: 480 },
  { day: "Wed", actual: 490, target: 480 },
  { day: "Thu", actual: 540, target: 480 },
  { day: "Fri", actual: 470, target: 480 },
  { day: "Sat", actual: 410, target: 480 },
  { day: "Sun", actual: 390, target: 480 },
];

// --- Sub-Components ---

// 1. Savings Champions Leaderboard
const Leaderboard = ({ blocks }: { blocks: BlockData[] }) => {
  const [sortBy, setSortBy] = useState<"efficiency" | "trust" | "credits">("efficiency");

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => {
      if (sortBy === "efficiency") {
        const aDelta = a.target - a.currentUsage;
        const bDelta = b.target - b.currentUsage;
        return bDelta - aDelta;
      }
      if (sortBy === "trust") return b.trustScore - a.trustScore;
      return b.creditsEarned - a.creditsEarned;
    });
  }, [sortBy]);

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  return (
    <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-white text-lg font-black tracking-tight">Water Champions</h2>
        </div>
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
          {(["efficiency", "trust", "credits"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortBy(mode)}
              className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase transition-all ${sortBy === mode ? "bg-[#334155] text-white" : "text-white/30 hover:text-white/60"
                }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {sortedBlocks.map((block, index) => {
          const efficiencyDelta = block.target - block.currentUsage;
          const isOver = efficiencyDelta < 0;
          
          let displayValue = "";
          let label = "";
          let percentage = 0;
          let metricColor = "text-[#38bdf8]";

          if (sortBy === "efficiency") {
            displayValue = `${Math.abs(efficiencyDelta)}L`;
            label = isOver ? "OVER" : "UNDER";
            percentage = (block.currentUsage / block.target) * 100;
            if (isOver) metricColor = "text-rose-400";
          } else if (sortBy === "trust") {
            displayValue = `${block.trustScore}%`;
            label = "TRUST";
            percentage = block.trustScore;
          } else {
            displayValue = `${block.creditsEarned} AC`;
            label = "CREDITS";
            // Map credits to a percentage for the bar (assuming max 200 for demo)
            percentage = (block.creditsEarned / 200) * 100;
          }

          return (
            <div
              key={block.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
            >
              <div className="w-8 text-center text-lg font-black text-white/40">
                {getMedal(index)}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                    {block.name}
                  </span>
                  <div className={`flex items-center gap-1 text-[10px] font-black tracking-tight ${metricColor}`}>
                    {sortBy === "efficiency" && (isOver ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
                    {displayValue} {label}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${sortBy === "efficiency" && isOver ? "bg-rose-500" : "bg-[#334155]"}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components (client-side only)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const Rectangle = dynamic(() => import("react-leaflet").then((mod) => mod.Rectangle), { ssr: false });
const TooltipMap = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

// 2. Consumption Heatmap (Cyber-Grid Schematic)
const ConsumptionHeatmap = ({ blocks }: { blocks: BlockData[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".cyber-pod", {
      scale: 0.8,
      opacity: 0,
      duration: 1,
      stagger: {
        grid: [2, 3],
        from: "center",
        amount: 0.5
      },
      ease: "elastic.out(1, 0.75)"
    });
  }, { scope: containerRef });

  const getColor = (usage: number, target: number) => {
    const ratio = usage / target;
    if (ratio < 0.6) return "from-cyan-500/80 to-cyan-500/40";
    if (ratio <= 1.0) return "from-[#38bdf8]/80 to-[#38bdf8]/40";
    return "from-rose-500/80 to-rose-500/40";
  };

  const getBorderColor = (usage: number, target: number) => {
    const ratio = usage / target;
    if (ratio < 0.6) return "border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]";
    if (ratio <= 1.0) return "border-[#38bdf8]/60 shadow-[0_0_15px_rgba(56,189,248,0.2)]";
    return "border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.4)]";
  };

  const getLiquidColor = (usage: number, target: number) => {
    const ratio = usage / target;
    if (ratio < 0.6) return "bg-cyan-500";
    if (ratio <= 1.0) return "bg-[#38bdf8]";
    return "bg-rose-500";
  };

  return (
    <div ref={containerRef} className="bg-[#0f172a]/60 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <h2 className="text-white text-lg font-black tracking-tight">Kambi Grid Schematic</h2>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Real-time flow distribution</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-white/60 tracking-widest uppercase">Live Nodes</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        {blocks.map((block) => {
          const ratio = Math.min(block.currentUsage / block.target, 1.2);
          const percentage = Math.min(ratio * 100, 100);
          const isOver = block.currentUsage > block.target;

          return (
            <div
              key={block.id}
              className={`cyber-pod relative aspect-[4/3] rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:z-20 group/pod ${getBorderColor(block.currentUsage, block.target)} bg-black/40 overflow-hidden`}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${getColor(block.currentUsage, block.target)}`} />
              
              {/* Liquid Fill */}
              <div 
                className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${getLiquidColor(block.currentUsage, block.target)}`}
                style={{ height: `${percentage}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-4 -translate-y-1/2 overflow-hidden">
                  <div className="w-[200%] h-full bg-white/10 blur-sm animate-wave" />
                </div>
              </div>

              {/* Data Overlay */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="text-[12px] font-black text-white tracking-[0.2em] uppercase drop-shadow-md">{block.name}</span>
                  {isOver && (
                    <div className="px-2 py-0.5 rounded bg-rose-600 text-[10px] font-black text-white uppercase tracking-tighter shadow-lg border border-rose-400">
                      LEAK ALERT
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">{block.currentUsage}</span>
                    <span className="text-[12px] font-bold text-white uppercase drop-shadow-md">Liters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/20">
                      <div 
                        className={`h-full ${isOver ? 'bg-rose-400' : 'bg-white'}`}
                        style={{ width: `${Math.min((block.currentUsage / block.target) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-white drop-shadow-md">{block.target}L</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-md">Trust Index</span>
                    <span className={`text-[12px] font-black drop-shadow-md ${block.trustScore > 80 ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {block.trustScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-[#38bdf8]/0 group-hover/pod:bg-[#38bdf8]/5 transition-colors pointer-events-none" />
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Optimal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Nominal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Critical</span>
          </div>
        </div>
        <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">Grid_ID: KB_0051</div>
      </div>

      {/* Decorative scanning line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent animate-scan" />

      <style jsx global>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave {
          animation: wave 3s linear infinite;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
          background-size: 50% 100%;
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

// 3. 7-Day Trend Chart
const TrendChart = () => {
  return (
    <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-cyan-500" />
          <h2 className="text-white text-lg font-black tracking-tight">7-Day Consumption Trend</h2>
        </div>
        <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Kambi Ward Central</div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "bold" }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }}
              itemStyle={{ color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorUsage)"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
        <div className="mt-1 p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
          <Info className="w-4 h-4" />
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          The community used <span className="text-rose-400 font-bold">12% more</span> than target on <span className="text-white font-bold">Thursday</span> — the worst day this week.
          Total savings are down by 800L compared to last week.
        </p>
      </div>
    </div>
  );
};

// --- Main Community Page ---

export default function CommunityPage() {
  const container = useRef<HTMLDivElement>(null);
  const [dynamicBlocks, setDynamicBlocks] = useState<BlockData[]>(mockBlocks);

  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: resData },
        { data: consData },
        { data: avgData },
        { data: creditData }
      ] = await Promise.all([
        supabase.from("water_reservations").select("*"),
        supabase.from("water_consumption").select("*"),
        supabase.from("weekly_averages").select("*"),
        supabase.from("user_credits").select("*")
      ]);

      const newBlocks = mockBlocks.map(b => ({ 
        ...b, 
        target: 0, 
        currentUsage: 0, 
        trustScore: 100, 
        creditsEarned: 0 
      }));

      const blockCount = mockBlocks.length;

      // Map targets (reservations)
      (resData || []).forEach(r => {
        const charCode = r.email ? r.email.charCodeAt(0) : 65;
        const index = charCode % blockCount;
        newBlocks[index].target += r.reserved_amount;
      });

      // Map current usage
      (consData || []).forEach(c => {
        const charCode = c.email ? c.email.charCodeAt(0) : 65;
        const index = charCode % blockCount;
        newBlocks[index].currentUsage += c.amount;
      });

      // Map credits
      (creditData || []).forEach(cr => {
        const charCode = cr.user_id ? cr.user_id.charCodeAt(0) : 65;
        const index = charCode % blockCount;
        newBlocks[index].creditsEarned += cr.balance;
      });

      // Calculate Trust Scores (comparing usage to averages)
      (consData || []).forEach(c => {
        const userAvg = (avgData || []).find(a => a.user_id === c.email)?.avg_consumption || 80;
        const diff = Math.abs(userAvg - c.amount);
        let score = 100;
        if (diff > 5) score = 85;
        if (diff > 15) score = 60;
        if (diff > 25) score = 30;

        const charCode = c.email ? c.email.charCodeAt(0) : 65;
        const index = charCode % blockCount;
        // Average the scores for the block
        newBlocks[index].trustScore = Math.round((newBlocks[index].trustScore + score) / 2);
      });

      newBlocks.forEach(b => {
        const originalMock = mockBlocks.find(m => m.id === b.id);
        if (b.target === 0) b.target = originalMock?.target || 80;
        if (b.currentUsage === 0) b.currentUsage = originalMock?.currentUsage || 60;
        if (b.creditsEarned === 0) b.creditsEarned = originalMock?.creditsEarned || 50;
        if (b.trustScore === 100 && originalMock) b.trustScore = originalMock.trustScore;
      });

      setDynamicBlocks(newBlocks);
    };

    fetchData();

    const channel1 = supabase.channel('comm_cons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_consumption' }, fetchData)
      .subscribe();
    const channel2 = supabase.channel('comm_res')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_reservations' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, []);

  useGSAP(() => {
    gsap.from(".comm-card", {
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
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[9px] font-black text-[#38bdf8] tracking-[0.3em] uppercase backdrop-blur-md">
                  ADMIN CONSOLE
                </div>
                <span className="text-white/20 text-[9px] font-bold tracking-[0.2em] uppercase">SYSTEM INSIGHTS</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black metallic-gradient tracking-tighter mb-4 filter drop-shadow-[0_10px_30px_rgba(56,189,248,0.2)]">
                COMMUNITY HUB
              </h1>
              <p className="text-white/40 text-sm font-medium tracking-tight max-w-lg leading-relaxed">
                Visualizing the metallic flow of collective responsibility.
                Our ward analytics represent the transparency and efficiency of every shared drop.
              </p>
            </div>

            <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-1000">
              <div className="text-right">
                <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-1">Total Savings</div>
                <div className="text-3xl font-black metallic-gradient tracking-tight">+1,240L</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-right">
                <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-1">Active Blocks</div>
                <div className="text-3xl font-black text-white tracking-tight">06 / 06</div>
              </div>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Leaderboard */}
            <div className="lg:col-span-5 comm-card h-full">
              <Leaderboard blocks={dynamicBlocks} />
            </div>

            {/* Right Column: Map + Chart */}
            <div className="lg:col-span-7 flex flex-col gap-8 h-full">
              <div className="comm-card">
                <ConsumptionHeatmap blocks={dynamicBlocks} />
              </div>
              <div className="comm-card">
                <TrendChart />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
          color: transparent;
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
