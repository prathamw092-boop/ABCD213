"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  History,
  Zap,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Award,
  Crown
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface CreditTransaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export default function CreditHubPage() {
  const { user } = useAuth();
  const container = useRef<HTMLDivElement>(null);

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    const [balanceRes, transRes] = await Promise.all([
      supabase.from("user_credits").select("balance").eq("user_id", user.id).maybeSingle(),
      supabase.from("credit_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    ]);

    if (balanceRes.data) setBalance(balanceRes.data.balance);
    if (transRes.data) setTransactions(transRes.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase.channel('credit_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_transactions', filter: `user_id=eq.${user?.id}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_credits', filter: `user_id=eq.${user?.id}` }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useGSAP(() => {
    gsap.from(".hub-card", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "expo.out"
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-sans">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105">
        <source src="/water.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/95 via-[#020617]/80 to-[#020617]/95" />

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">

          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 tracking-[0.3em] uppercase backdrop-blur-md">
                TRUTH ECONOMY
              </div>
              <span className="text-white/20 text-[9px] font-bold tracking-[0.2em] uppercase">VERIFIED CREDIT SCORE</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter mb-6 filter drop-shadow-[0_10px_30px_rgba(52,211,153,0.3)]">
              CREDIT HUB
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium tracking-tight max-w-2xl leading-relaxed">
              Your community status is built on honesty. Earn Aqua Credits by reporting truthfully and conserving community resources. High integrity scores unlock exclusive community governance rights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="hub-card relative group p-10 rounded-[3rem] bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-3xl overflow-hidden flex flex-col items-center justify-center">
                <div className="text-[10px] font-black tracking-[0.4em] text-emerald-500/50 uppercase mb-4">Integrity Balance</div>
                <div className="text-7xl font-black bg-gradient-to-b from-emerald-300 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {balance} <span className="text-4xl text-emerald-500/40">AC</span>
                </div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Community Verified
                </div>``
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
              </div>

              <div className="hub-card grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">Rank</div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xl font-black text-white">{balance > 150 ? 'Elite' : balance > 100 ? 'Guardian' : 'Citizen'}</span>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">Community Standings</div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#38bdf8]" />
                    <span className="text-xl font-black text-white">Top 12%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="hub-card p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl h-full flex flex-col">
                <h2 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
                  <History className="w-6 h-6 text-emerald-400" />
                  Audit Trail
                </h2>

                <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar max-h-[500px]">
                  {loading ? (
                    <div className="flex justify-center py-20 opacity-20">
                      <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 pb-20">
                      <Zap className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-xs uppercase tracking-widest font-bold">No integrity history</p>
                    </div>
                  ) : (
                    transactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                            {tx.amount > 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                          </div>
                          <div>
                            <div className="text-white text-sm font-bold truncate max-w-[250px]">
                              {tx.reason}
                            </div>
                            <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                              {new Date(tx.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-xl font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} AC
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(52, 211, 153, 0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}
