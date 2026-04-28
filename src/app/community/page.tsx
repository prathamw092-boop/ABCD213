"use client";

import React, { useState, useMemo, useRef } from "react";
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

// --- Mock Data for 7-Day Trend ---
const trendData = [
  { day: "Mon", actual: 420, target: 480 },
  { day: "Tue", actual: 450, target: 480 },
  { day: "Wed", actual: 490, target: 480 },
  { day: "Thu", actual: 540, target: 480 }, // Worst day
  { day: "Fri", actual: 470, target: 480 },
  { day: "Sat", actual: 410, target: 480 },
  { day: "Sun", actual: 390, target: 480 },
];

// --- Sub-Components ---

// 1. Savings Champions Leaderboard
const Leaderboard = () => {
  const [sortBy, setSortBy] = useState<"efficiency" | "trust" | "credits">("efficiency");
  
  const sortedBlocks = useMemo(() => {
    return [...mockBlocks].sort((a, b) => {
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
              className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase transition-all ${
                sortBy === mode ? "bg-[#334155] text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {sortedBlocks.map((block, index) => {
          const delta = block.target - block.currentUsage;
          const isOver = delta < 0;
          const percentage = (block.currentUsage / block.target) * 100;

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
                  <div className={`flex items-center gap-1 text-[10px] font-black tracking-tight ${isOver ? "text-rose-400" : "text-[#38bdf8]"}`}>
                    {isOver ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(delta)}L {isOver ? "OVER" : "UNDER"}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isOver ? "bg-rose-500" : "bg-[#334155]"}`}
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

// 2. Consumption Heatmap (Leaflet Schematic Map)
const ConsumptionHeatmap = () => {
  // Use simple CRS for schematic map
  const [L, setL] = useState<any>(null);

  React.useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  const gridBlocks = [
    { id: "A", name: "Block A", row: 0, col: 0 }, { id: "B", name: "Block B", row: 0, col: 1 }, { id: "C", name: "Block C", row: 0, col: 2 },
    { id: "D", name: "Block D", row: 1, col: 0 }, { id: "E", name: "Block E", row: 1, col: 1 }, { id: "F", name: "Block F", row: 1, col: 2 },
  ];

  const getColor = (usage: number, target: number) => {
    const ratio = usage / target;
    if (ratio < 0.8) return "#06b6d4"; // Cyan
    if (ratio <= 1.0) return "#38bdf8"; // Sky
    return "#6366f1"; // Indigo
  };

  if (!L) return <div className="h-[300px] bg-black/20 animate-pulse rounded-xl" />;

  return (
    <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <MapIcon className="w-5 h-5 text-[#38bdf8]" />
        <h2 className="text-white text-lg font-black tracking-tight">Water Consumption Heatmap</h2>
      </div>

      <div className="h-[300px] w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={[[0, 0], [220, 340]]}
          style={{ height: "100%", width: "100%", background: "transparent" }}
          zoomControl={false}
          attributionControl={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          dragging={false}
        >
          {gridBlocks.map((pos) => {
            const block = mockBlocks.find(b => b.id === pos.id)!;
            const x = pos.col * 110 + 10;
            const y = 210 - (pos.row * 100 + 100); // Invert Y for Leaflet CRS.Simple
            
            const bounds: [[number, number], [number, number]] = [
              [y, x], 
              [y + 90, x + 100]
            ];

            const color = getColor(block.currentUsage, block.target);

            return (
              <Rectangle
                key={pos.id}
                bounds={bounds}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.3,
                  color: color,
                  weight: 2
                }}
              >
                <TooltipMap permanent direction="center" className="schematic-tooltip">
                  <div className="text-center">
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">{block.name}</div>
                    <div className="text-[8px] font-bold text-white/60">{block.currentUsage}L / {block.target}L</div>
                    <div className="text-[7px] font-bold text-white/40 mt-1 uppercase">Trust: {block.trustScore}%</div>
                  </div>
                </TooltipMap>
              </Rectangle>
            );
          })}
        </MapContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-[8px] font-black tracking-[0.2em] text-white/30 uppercase">
        <span>Low Consumption</span>
        <div className="h-1 flex-1 mx-4 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500" />
        <span>High Consumption</span>
      </div>

      <style jsx global>{`
        .schematic-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: white !important;
        }
        .leaflet-container {
          background-color: transparent !important;
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
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
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
    <div ref={container} className="min-h-screen bg-[#020617] pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[9px] font-black text-[#38bdf8] tracking-widest uppercase">
                Admin Console
              </div>
              <span className="text-white/20 text-[9px] font-bold tracking-[0.2em] uppercase">Water Pulse v2.0</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Community Insights</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-1">Total Savings</div>
              <div className="text-2xl font-black text-cyan-400 tracking-tight">+1,240L</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-1">Active Blocks</div>
              <div className="text-2xl font-black text-white tracking-tight">06 / 06</div>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Leaderboard */}
          <div className="lg:col-span-5 comm-card h-full">
            <Leaderboard />
          </div>

          {/* Right Column: Map + Chart */}
          <div className="lg:col-span-7 flex flex-col gap-8 h-full">
            <div className="comm-card">
              <ConsumptionHeatmap />
            </div>
            <div className="comm-card">
              <TrendChart />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
