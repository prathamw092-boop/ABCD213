"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { 
  Droplets, 
  Plus, 
  History, 
  Users, 
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ConsumptionRecord {
  id: string;
  email: string;
  amount: number;
  consumption_date: string;
}

export default function LedgerPage() {
  const { user, role } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const container = useRef<HTMLDivElement>(null);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("water_consumption")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useGSAP(() => {
    gsap.from(".ledger-card", {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !user) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("water_consumption").insert({
      user_id: user.id,
      email: user.email,
      amount: parseInt(amount),
    });

    if (!error) {
      setAmount("");
      fetchRecords();
    }
    setIsSubmitting(false);
  };

  const totalCommunityUsage = records.reduce((sum, r) => sum + r.amount, 0);

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

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[9px] font-black text-[#38bdf8] tracking-[0.3em] uppercase backdrop-blur-md">
                  LIVE LEDGER
                </div>
                <span className="text-white/20 text-[9px] font-bold tracking-[0.2em] uppercase">COMMUNITY TRACKING</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black metallic-gradient tracking-tighter mb-4 filter drop-shadow-[0_10px_30px_rgba(56,189,248,0.2)]">
                TALLY LEDGER
              </h1>
              <p className="text-white/40 text-sm font-medium tracking-tight max-w-lg leading-relaxed">
                A shared digital record of every drop. Your manual entries contribute to the metallic grid of ward-wide accountability.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center min-w-[120px]">
                <div className="text-2xl font-black text-white">{records.length}</div>
                <div className="text-[8px] font-black tracking-widest text-white/30 uppercase mt-1">Daily Marks</div>
              </div>
              <div className="px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center min-w-[120px]">
                <div className="text-2xl font-black metallic-gradient">{totalCommunityUsage}L</div>
                <div className="text-[8px] font-black tracking-widest text-white/30 uppercase mt-1">Total Flow</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Form */}
            <div className="lg:col-span-5 space-y-8">
              <div className="ledger-card p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-[#38bdf8]/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-[#38bdf8] w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Add Consumption</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase block ml-1">
                      Amount (Liters)
                    </label>
                    <div className="relative group">
                      <Droplets className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#38bdf8] transition-all" />
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-[#38bdf8]/40 transition-all text-xl font-medium placeholder:text-white/10"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || !user}
                    className="w-full py-5 bg-[#38bdf8] text-[#020617] rounded-2xl font-black tracking-[0.3em] uppercase text-[10px] hover:bg-white transition-all duration-500 flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? "UPDATING GRID..." : (
                      <>
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                        Log Consumption
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="ledger-card p-8 rounded-[2.5rem] bg-[#38bdf8]/5 border border-[#38bdf8]/10 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[#38bdf8]/10 text-[#38bdf8]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Conservation Credits</h4>
                    <p className="text-xs text-white/40 leading-relaxed">
                      Every mark you add increases your trust score and contributes to community rewards.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Community Feed */}
            <div className="lg:col-span-7">
              <div className="ledger-card p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/5 h-full">
                <div className="bg-[#0f172a]/60 backdrop-blur-3xl rounded-[2.4rem] p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <History className="text-white/60 w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Community Flow</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                      <span className="text-[10px] font-black tracking-widest text-[#38bdf8] uppercase">Live</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto max-h-[550px] pr-2 custom-scrollbar">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full py-20 gap-4 opacity-40">
                        <div className="w-8 h-8 border-2 border-[#38bdf8]/20 border-t-[#38bdf8] rounded-full animate-spin" />
                      </div>
                    ) : records.length === 0 ? (
                      <div className="text-center py-20 opacity-20">
                        <Droplets className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase">No Grid Data</p>
                      </div>
                    ) : (
                      records.map((record) => (
                        <div 
                          key={record.id}
                          className="group flex items-center justify-between p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-[#38bdf8]/30 transition-all duration-500"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-[11px] font-black border border-white/10 group-hover:border-[#38bdf8]/40 transition-colors">
                              {record.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors">{record.email}</div>
                              <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">
                                {new Date(record.consumption_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="hidden sm:flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                              {[...Array(Math.min(5, Math.ceil(record.amount / 20)))].map((_, i) => (
                                <div key={i} className="w-[3px] h-5 bg-[#38bdf8] rounded-full transform -rotate-12 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                              ))}
                            </div>
                            <div className="text-2xl font-black metallic-gradient tabular-nums">{record.amount}L</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.2); }
      `}</style>
    </div>
  );
}
