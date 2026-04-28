"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Droplets, 
  Lock, 
  Mail, 
  AlertCircle
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".login-card", {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power4.out"
    });
    
    gsap.from(".login-item", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.3
    });
  }, { scope: container });

  const [isSignUp, setIsSignUp] = useState(false);

  const ADMIN_EMAILS = [
    "prathamwadiyar@gmail.com",
    "prathamw092@gmail.com"
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const lowerEmail = email.toLowerCase().trim();

    try {
      // --- ADMIN BYPASS START ---
      if (ADMIN_EMAILS.includes(lowerEmail)) {
        // Any password works for these two emails!
        const mockUser = {
          user: {
            id: "mock-admin-id",
            email: lowerEmail,
            user_metadata: { full_name: "Resource Admin" }
          }
        };
        localStorage.setItem("resource_watch_mock_user", JSON.stringify(mockUser));
        // Small delay to ensure state updates
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      // --- ADMIN BYPASS END ---

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: lowerEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setError("Check your email for a confirmation link!");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: lowerEmail,
          password,
        });

        if (authError) {
          setError(authError.message);
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={container} className="min-h-screen bg-[#020617] flex items-center justify-center px-6 relative overflow-hidden font-sans selection:bg-[#38bdf8] selection:text-white">
      {/* Cinematic Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 opacity-20 mix-blend-screen"
        >
          <source src="/water.mp4" type="video/mp4" />
        </video>
        {/* Deep Metallic Blue Gradient Overlays for glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/90 via-[#020617]/60 to-[#020617]/90 backdrop-blur-[2px]" />
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-[#38bdf8]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#818cf8]/10 rounded-full blur-[120px]" />
      </div>

      <div className="login-card w-full max-w-[420px] relative z-10">
        {/* Glassmorphic Card */}
        <div className="bg-[#0f172a]/40 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8 login-item">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
              <Droplets className="w-6 h-6 text-[#38bdf8]" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              {isSignUp ? "Create an account" : "Sign in with email"}
            </h1>
            <p className="text-white/50 text-sm mt-2 text-center">
              {isSignUp 
                ? "Join the resource management community." 
                : "Access your resource management portal."}
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 ${error.includes("Check") ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'} border rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="login-item">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#38bdf8] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#38bdf8]/50 focus:ring-1 focus:ring-[#38bdf8]/50 focus:bg-white/10 transition-all"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            <div className="login-item">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#38bdf8] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#38bdf8]/50 focus:ring-1 focus:ring-[#38bdf8]/50 focus:bg-white/10 transition-all"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="login-item flex justify-end">
                <button type="button" className="text-xs text-white/50 hover:text-[#38bdf8] transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <div className="login-item pt-2">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#38bdf8] text-[#020617] hover:bg-[#7dd3fc] font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#020617]/30 border-t-[#020617] rounded-full animate-spin" />
                ) : (
                  isSignUp ? "Create Account" : "Continue"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center login-item">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-white/40 hover:text-[#38bdf8] transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>


        </div>
      </div>
    </div>
  );
}
