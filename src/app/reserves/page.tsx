"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, 
  ArrowRightLeft, 
  Waves, 
  Info,
  TrendingDown,
  Droplet,
  Zap
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Reservation {
  reserved_amount: number;
}

interface RedistStat {
  total_redistributed: number;
  total_users: number;
}

export default function ReservesPage() {
  const { user } = useAuth();
  const [reserveAmount, setReserveAmount] = useState<string>("100");
  const [currentReserve, setCurrentReserve] = useState<number>(0);
  const [redistStats, setRedistStats] = useState<RedistStat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const container = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!user) return;
    
    // Fetch user's current reservation
    const { data: resData } = await supabase
      .from("water_reservations")
      .select("reserved_amount")
      .eq("user_id", user.id)
      .single();

    if (resData) {
      setCurrentReserve(resData.reserved_amount);
      setReserveAmount(resData.reserved_amount.toString());
    }

    // Fetch redistribution stats
    const { data: statsData } = await supabase
      .from("redistribution_stats")
      .select("*")
      .single();

    if (statsData) {
      setRedistStats(statsData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    const channel = supabase.channel('reserves_redist')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_reservations' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'water_consumption' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useGSAP(() => {
    gsap.from(".reserve-card", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "expo.out"
    });

    gsap.to(".wave-fill", {
      y: -10,
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: "sine.inOut"
    });
  }, { scope: container });

  const handleUpdateReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from("water_reservations")
      .upsert({
        user_id: user.id,
        email: user.email,
        reserved_amount: parseInt(reserveAmount),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (!error) {
      setCurrentReserve(parseInt(reserveAmount));
      // Success logic
    }
    setIsSubmitting(false);
  };

  return (
    <div ref={container} className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-sans">
      {/* Cinematic Background */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105">
        <source src="/water.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/95 via-[#020617]/40 to-[#020617]/95" />

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[9px] font-black text-[#38bdf8] tracking-[0.3em] uppercase backdrop-blur-md">
                RESERVE PROTOCOL
              </div>
              <span className="text-white/20 text-[9px] font-bold tracking-[0.2em] uppercase">QUOTA SHARING ACTIVATED</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black metallic-gradient tracking-tighter mb-6 filter drop-shadow-[0_10px_30px_rgba(56,189,248,0.3)]">
              RESERVE WATER
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium tracking-tight max-w-2xl leading-relaxed">
              Lock in your daily quota. If you don't use it, the community benefits. Unused reserves are automatically redistributed to ensure no drop is wasted.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Interactive Tank */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="reserve-card relative group p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
                {/* Tank Visualization */}
                <div className="relative w-48 h-64 border-4 border-white/10 rounded-[3rem] overflow-hidden bg-black/20 shadow-2xl">
                  {/* Water Fill */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#38bdf8] to-[#0ea5e9] transition-all duration-1000 ease-out wave-fill"
                    style={{ height: `${Math.min(100, (currentReserve / 200) * 100)}%` }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-4 bg-white/20 blur-sm" />
                    <Waves className="absolute top-2 left-1/2 -translate-x-1/2 text-white/40 w-8 h-8 opacity-20" />
                  </div>
                  
                  {/* Gauge Marks */}
                  <div className="absolute inset-0 flex flex-col justify-between py-8 px-4 opacity-20 pointer-events-none">
                    {[200, 150, 100, 50, 0].map(val => (
                      <div key={val} className="flex items-center justify-between">
                        <div className="w-4 h-[1px] bg-white" />
                        <span className="text-[8px] font-black text-white">{val}L</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 text-center">
                  <div className="text-5xl font-black metallic-gradient mb-2">{currentReserve}L</div>
                  <div className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase">Active Daily Reserve</div>
                </div>

                {/* Glass Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#38bdf8]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#38bdf8]/20 transition-all duration-700" />
              </div>

              {/* Redistribution Info Card */}
              <div className="reserve-card p-8 rounded-[2.5rem] bg-[#38bdf8]/5 border border-[#38bdf8]/10 backdrop-blur-xl">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-[#38bdf8]/20 rounded-2xl flex items-center justify-center shrink-0">
                    <ArrowRightLeft className="text-[#38bdf8] w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Yesterday's Redistribution</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#38bdf8]">{redistStats?.total_redistributed || 0}L</span>
                      <span className="text-xs text-white/30 font-bold uppercase tracking-widest">Shared in Ward</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-3 leading-relaxed">
                      Water from {redistStats?.total_users || 0} residents was redistributed to active users based on conservation efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Controls & Rules */}
            <div className="lg:col-span-7 space-y-8">
              <div className="reserve-card p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl">
                <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Reservation Control</h2>
                
                <form onSubmit={handleUpdateReserve} className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase ml-1">
                        Daily Quota (Liters)
                      </label>
                      <span className="text-[10px] font-black text-[#38bdf8] uppercase">Recommended: 80-120L</span>
                    </div>
                    <div className="relative group">
                      <Droplet className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-[#38bdf8] transition-all" />
                      <input 
                        type="range"
                        min="20"
                        max="200"
                        step="5"
                        value={reserveAmount}
                        onChange={(e) => setReserveAmount(e.target.value)}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
                      />
                      <div className="flex justify-between mt-4 px-1">
                        <span className="text-[10px] font-black text-white/20">20L</span>
                        <div className="text-3xl font-black text-white tracking-tighter">{reserveAmount}L</div>
                        <span className="text-[10px] font-black text-white/20">200L</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || !user}
                    className="w-full py-6 bg-[#38bdf8] text-[#020617] rounded-3xl font-black tracking-[0.4em] uppercase text-xs hover:bg-white hover:scale-[1.02] transition-all duration-500 flex items-center justify-center gap-4 group disabled:opacity-50"
                  >
                    {isSubmitting ? "UPDATING VAULT..." : (
                      <>
                        <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Lock In Reservation
                      </>
                    )}
                  </button>
                </form>

                {!user && (
                  <div className="mt-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <p className="text-[10px] font-black text-rose-400 tracking-widest uppercase">
                      Authentication required to manage reserves
                    </p>
                  </div>
                )}
              </div>

              {/* Protocol Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="reserve-card p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:bg-white/[0.08] transition-all duration-500">
                  <TrendingDown className="text-[#38bdf8] w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-bold mb-2">Unused Water</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    If your daily consumption is below your reserve, the surplus is moved to the "Community Pool" at midnight.
                  </p>
                </div>
                <div className="reserve-card p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:bg-white/[0.08] transition-all duration-500">
                  <Zap className="text-amber-400 w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-bold mb-2">Trust Bonus</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    Consistently accurate reservations increase your Trust Score, unlocking higher redistribution priority.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #38bdf8;
          cursor: pointer;
          border-radius: 50%;
          border: 4px solid #fff;
          box-shadow: 0 0 15px rgba(56,189,248,0.5);
        }
      `}</style>
    </div>
  );
}
