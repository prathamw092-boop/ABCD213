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
      // Show success animation or toast
    }
    setIsSubmitting(false);
  };

  const totalCommunityUsage = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <main ref={container} className="min-h-screen bg-[#020617] pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
      {/* Background elements consistent with theme */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#38bdf8]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#818cf8]/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="ledger-card p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#38bdf8]/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-[#38bdf8] w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Tally-stick Ledger</h2>
                <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Daily Consumption Marks</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-3 block">
                  Amount (Liters)
                </label>
                <div className="relative group">
                  <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#38bdf8] transition-colors" />
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#38bdf8]/50 transition-all text-lg font-medium"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full py-4 bg-[#38bdf8] text-[#020617] rounded-2xl font-bold tracking-widest uppercase text-xs hover:bg-[#7dd3fc] transition-all flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? "UPDATING..." : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Daily Mark
                  </>
                )}
              </button>
              {!user && (
                <p className="text-rose-400 text-[10px] text-center font-bold tracking-widest uppercase">
                  Log in to participate in the ledger
                </p>
              )}
            </form>
          </div>

          {/* Quick Stats */}
          <div className="ledger-card grid grid-cols-2 gap-4">
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <Users className="text-[#38bdf8]/50 w-5 h-5 mb-3" />
              <div className="text-2xl font-black text-white">{records.length}</div>
              <div className="text-[9px] font-black tracking-widest text-white/30 uppercase mt-1">Active Tallys</div>
            </div>
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <Award className="text-amber-400/50 w-5 h-5 mb-3" />
              <div className="text-2xl font-black text-white">{totalCommunityUsage}L</div>
              <div className="text-[9px] font-black tracking-widest text-white/30 uppercase mt-1">Total Consumption</div>
            </div>
          </div>
        </div>

        {/* Right Column: Community Feed */}
        <div className="lg:col-span-7">
          <div className="ledger-card p-8 rounded-[2rem] bg-[#0f172a]/40 border border-white/10 backdrop-blur-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <History className="text-white/60 w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Community Ledger</h3>
              </div>
              <div className="text-[10px] font-black tracking-widest text-[#38bdf8] uppercase bg-[#38bdf8]/10 px-4 py-2 rounded-full border border-[#38bdf8]/20">
                Live Updates
              </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20 gap-4 opacity-40">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <p className="text-[10px] font-bold tracking-widest uppercase">Fetching Records...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <Droplets className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs font-bold tracking-widest uppercase">No records found today</p>
                </div>
              ) : (
                records.map((record, index) => (
                  <div 
                    key={record.id}
                    className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#38bdf8]/30 transition-all hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-[10px] font-black border border-white/10">
                        {record.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white/90">{record.email}</div>
                        <div className="text-[10px] text-white/30 font-medium mt-1">
                          {new Date(record.consumption_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {[...Array(Math.min(5, Math.ceil(record.amount / 20)))].map((_, i) => (
                          <div key={i} className="w-[2px] h-4 bg-[#38bdf8]/40 rounded-full transform -rotate-12" />
                        ))}
                      </div>
                      <div className="text-xl font-black text-[#38bdf8] tabular-nums">{record.amount}L</div>
                      <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
