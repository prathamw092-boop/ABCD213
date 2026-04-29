"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { 
  Activity, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XOctagon,
  Droplets,
  Fingerprint
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type AnalysisResult = "idle" | "analyzing" | "truth" | "lie" | "waste";

export default function VerifyPage() {
  const { user } = useAuth();
  const container = useRef<HTMLDivElement>(null);
  
  const [inputValue, setInputValue] = useState<string>("");
  const [resultState, setResultState] = useState<AnalysisResult>("idle");
  const [weeklyAverage, setWeeklyAverage] = useState<number | null>(null);

  // Fetch historical data to compute average
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("water_consumption")
        .select("amount")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(7);

      if (data && data.length > 0) {
        const sum = data.reduce((acc, curr) => acc + curr.amount, 0);
        setWeeklyAverage(Math.round(sum / data.length));
      } else {
        // Fallback baseline if no history exists for the hackathon
        setWeeklyAverage(100); 
      }
    };
    
    fetchHistory();
  }, [user]);

  useGSAP(() => {
    gsap.from(".verify-card", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "expo.out"
    });
  }, { scope: container });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputValue) return;

    const currentIntake = parseInt(inputValue);
    const avg = weeklyAverage || 100;
    const tolerance = 25; // Liter tolerance

    setResultState("analyzing");

    // Simulate Deep Analysis
    setTimeout(async () => {
      if (currentIntake < avg - tolerance) {
        setResultState("lie");
      } else if (currentIntake > avg + tolerance) {
        setResultState("waste");
      } else {
        setResultState("truth");
        
        // Only valid inputs get logged securely
        await supabase.from("water_consumption").upsert({
          user_id: user.id,
          email: user.email,
          amount: currentIntake,
          consumption_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
    }, 2000);
  };

  const getResultUI = () => {
    switch(resultState) {
      case "analyzing":
        return (
          <div className="flex flex-col items-center justify-center p-12 animate-pulse">
            <Activity className="w-16 h-16 text-[#38bdf8] mb-6 animate-spin-slow" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Running Truth Protocol</h3>
            <p className="text-white/40 text-sm mt-2">Cross-referencing historical patterns...</p>
          </div>
        );
      case "truth":
        return (
          <div className="flex flex-col items-center justify-center p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-6" />
            <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-widest text-center">Verified Truth</h3>
            <p className="text-white/60 text-sm mt-4 text-center max-w-sm leading-relaxed">
              Your reported consumption ({inputValue}L) matches your historical average ({weeklyAverage}L). Thank you for your honest reporting.
            </p>
          </div>
        );
      case "lie":
        return (
          <div className="flex flex-col items-center justify-center p-12 bg-rose-500/10 border border-rose-500/20 rounded-3xl">
            <XOctagon className="w-16 h-16 text-rose-500 mb-6" />
            <h3 className="text-2xl font-black text-rose-500 uppercase tracking-widest text-center">Suspiciously Low</h3>
            <p className="text-white/60 text-sm mt-4 text-center max-w-sm leading-relaxed">
              Your report ({inputValue}L) is severely below your historical average ({weeklyAverage}L). The system flagged this as a potential false report.
            </p>
          </div>
        );
      case "waste":
        return (
          <div className="flex flex-col items-center justify-center p-12 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
            <AlertTriangle className="w-16 h-16 text-amber-400 mb-6" />
            <h3 className="text-2xl font-black text-amber-400 uppercase tracking-widest text-center">High Consumption</h3>
            <p className="text-white/60 text-sm mt-4 text-center max-w-sm leading-relaxed">
              Your report ({inputValue}L) is unusually high compared to your average ({weeklyAverage}L). Did you host a function, or is there a leakage wasting water?
            </p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-12 border border-white/5 bg-white/[0.02] rounded-3xl">
            <Fingerprint className="w-16 h-16 text-white/10 mb-6" />
            <h3 className="text-xl font-black text-white/30 uppercase tracking-widest">Awaiting Input</h3>
          </div>
        );
    }
  };

  return (
    <div ref={container} className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-sans">
      {/* Background */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 scale-105">
        <source src="/water.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-[#020617]/50" />

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 tracking-[0.3em] uppercase backdrop-blur-md">
                TRUTH ENGINE
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-br from-indigo-300 via-[#38bdf8] to-indigo-600 bg-clip-text text-transparent tracking-tighter mb-6 filter drop-shadow-[0_10px_30px_rgba(99,102,241,0.2)]">
              CONSUMPTION AUDIT
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium tracking-tight max-w-2xl mx-auto leading-relaxed">
              Submit your daily water usage. Our AI-driven protocol cross-references your input against historical weekly averages to detect anomalies, false reports, or excessive waste.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left: Input Form */}
            <div className="verify-card p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden">
              <h2 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
                <Search className="w-6 h-6 text-[#38bdf8]" />
                Input Data
              </h2>
              
              <form onSubmit={handleAnalyze} className="space-y-8 relative z-10">
                <div>
                  <label className="block text-[10px] font-black tracking-[0.3em] text-white/40 uppercase mb-3">
                    Today's Intake (Liters)
                  </label>
                  <div className="relative group">
                    <Droplets className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-[#38bdf8] transition-colors" />
                    <input 
                      type="number"
                      required
                      min="1"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-3xl font-black text-white focus:outline-none focus:border-[#38bdf8]/50 transition-all"
                    />
                  </div>
                </div>

                {weeklyAverage !== null && (
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Historical Baseline</span>
                    <span className="text-sm font-bold text-white/60">{weeklyAverage}L</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={resultState === "analyzing" || !user}
                  className="w-full py-6 bg-gradient-to-r from-indigo-500 to-[#38bdf8] text-white rounded-2xl font-black tracking-[0.3em] uppercase text-sm hover:scale-[1.02] transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.2)] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {resultState === "analyzing" ? "ANALYZING..." : "INITIATE AUDIT"}
                </button>
              </form>

              {!user && (
                <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center relative z-10">
                  <p className="text-[10px] font-black text-rose-400 tracking-widest uppercase">
                    Log in to run Truth Engine
                  </p>
                </div>
              )}

              {/* Glow */}
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#38bdf8]/10 rounded-full blur-[80px] pointer-events-none" />
            </div>

            {/* Right: Output Result */}
            <div className="verify-card flex flex-col justify-center">
              {getResultUI()}
            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
