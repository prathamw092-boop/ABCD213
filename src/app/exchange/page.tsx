"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { 
  ArrowRightLeft, 
  Send, 
  History, 
  Droplets, 
  Zap, 
  ShieldCheck,
  User
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Trade {
  id: string;
  sender_email: string;
  receiver_email: string;
  amount: number;
  created_at: string;
  status: string;
}

export default function ExchangePage() {
  const { user } = useAuth();
  const container = useRef<HTMLDivElement>(null);
  
  const [balance, setBalance] = useState<number>(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [communityUsers, setCommunityUsers] = useState<string[]>([]);
  
  const [receiverEmail, setReceiverEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    // 1. Calculate Balance
    const [{ data: resData }, { data: consData }, { data: tradesData }] = await Promise.all([
      supabase.from("water_reservations").select("reserved_amount").eq("user_id", user.id).single(),
      supabase.from("water_consumption").select("amount").eq("user_id", user.id),
      supabase.from("credit_trades").select("*").or(`sender_id.eq.${user.id},receiver_email.eq.${user.email}`)
    ]);

    const reserved = resData?.reserved_amount || 0;
    const consumed = (consData || []).reduce((sum, row) => sum + row.amount, 0);
    
    let tradeBalance = 0;
    (tradesData || []).forEach(t => {
      if (t.sender_id === user.id) tradeBalance -= t.amount;
      if (t.receiver_email === user.email) tradeBalance += t.amount;
    });

    const currentBalance = (reserved - consumed) + tradeBalance;
    setBalance(currentBalance > 0 ? currentBalance : 0);
    setTrades(tradesData?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []);

    // 2. Get other users for dropdown
    const { data: usersData } = await supabase.from("water_reservations").select("email").neq("user_id", user.id);
    if (usersData) {
      const emails = Array.from(new Set(usersData.map(u => u.email).filter(Boolean)));
      setCommunityUsers(emails);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase.channel('exchange_trades')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_trades' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_consumption' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useGSAP(() => {
    gsap.from(".exch-card", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "expo.out"
    });
  }, { scope: container });

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;
    const amt = parseInt(transferAmount);
    if (isNaN(amt) || amt <= 0 || amt > balance) {
      alert("Invalid amount or insufficient balance.");
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase.from("credit_trades").insert({
      sender_id: user.id,
      sender_email: user.email,
      receiver_email: receiverEmail,
      amount: amt
    });

    if (!error) {
      setTransferAmount("");
      setReceiverEmail("");
    } else {
      alert("Trade failed.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div ref={container} className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-sans">
      {/* Background */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105">
        <source src="/water.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/95 via-[#020617]/80 to-[#020617]/95" />

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 tracking-[0.3em] uppercase backdrop-blur-md">
                P2P MARKET
              </div>
              <span className="text-white/20 text-[9px] font-bold tracking-[0.2em] uppercase">CREDIT EXCHANGE PROTOCOL</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter mb-6 filter drop-shadow-[0_10px_30px_rgba(52,211,153,0.3)]">
              AQUA CREDITS
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium tracking-tight max-w-2xl leading-relaxed">
              Trade your surplus water reserves as Aqua Credits. Empower your community by transferring unused quota to neighbors in need, fostering a sustainable, circular water economy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Balance & Controls */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              {/* Balance Card */}
              <div className="exch-card relative group p-10 rounded-[3rem] bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-3xl overflow-hidden flex flex-col items-center justify-center">
                <div className="text-[10px] font-black tracking-[0.4em] text-emerald-500/50 uppercase mb-4">Available Balance</div>
                <div className="text-7xl font-black bg-gradient-to-b from-emerald-300 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {balance} <span className="text-4xl text-emerald-500/40">AC</span>
                </div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Confirmed Assets
                </div>
                
                {/* Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
              </div>

              {/* Trade Form */}
              <div className="exch-card p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <h2 className="text-xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                  <Send className="w-5 h-5 text-emerald-400" />
                  Initiate Transfer
                </h2>
                
                <form onSubmit={handleTrade} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black tracking-[0.3em] text-white/40 uppercase mb-3">
                      Recipient
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <select 
                        required
                        value={receiverEmail}
                        onChange={(e) => setReceiverEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                      >
                        <option value="" disabled className="bg-[#020617] text-white/50">Select neighbor</option>
                        {communityUsers.map(u => (
                          <option key={u} value={u} className="bg-[#020617]">{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black tracking-[0.3em] text-white/40 uppercase mb-3">
                      Amount (AC)
                    </label>
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                      <input 
                        type="number"
                        required
                        min="1"
                        max={balance}
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xl font-bold text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || !user || balance <= 0}
                    className="w-full py-5 mt-4 bg-emerald-500 text-black rounded-2xl font-black tracking-[0.3em] uppercase text-xs hover:bg-emerald-400 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSubmitting ? "PROCESSING..." : "AUTHORIZE TRANSFER"}
                  </button>
                </form>

                {!user && (
                  <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <p className="text-[10px] font-black text-rose-400 tracking-widest uppercase">
                      Log in to access exchange
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: History */}
            <div className="lg:col-span-7 space-y-8">
              <div className="exch-card p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl h-full flex flex-col">
                <h2 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
                  <History className="w-6 h-6 text-emerald-400" />
                  Transaction Ledger
                </h2>
                
                <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                  {trades.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 pb-20">
                      <ArrowRightLeft className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-xs uppercase tracking-widest font-bold">No trading history</p>
                    </div>
                  ) : (
                    trades.map(trade => {
                      const isSender = trade.sender_email === user?.email;
                      return (
                        <div key={trade.id} className="flex items-center justify-between p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSender ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                              <ArrowRightLeft className={`w-4 h-4 ${isSender ? 'text-rose-400' : 'text-emerald-400'}`} />
                            </div>
                            <div>
                              <div className="text-white text-sm font-bold">
                                {isSender ? `Sent to ${trade.receiver_email}` : `Received from ${trade.sender_email}`}
                              </div>
                              <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                                {new Date(trade.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className={`text-xl font-black ${isSender ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isSender ? '-' : '+'}{trade.amount} AC
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(52, 211, 153, 0.2);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
