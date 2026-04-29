'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, X, Droplets, AlertTriangle, CheckCircle2, Clock, MessageSquare, Zap, TrendingUp, TrendingDown, ClipboardList } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'water' | 'complaint' | 'alert' | 'credit';
  status?: string;
  time: string;
  timestamp: number;
  icon: React.ReactNode;
  colorClass: string;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(dropdownRef.current,
        { opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out', display: 'block' }
      );
    } else {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.9,
        filter: 'blur(10px)',
        duration: 0.3,
        ease: 'expo.in',
        display: 'none'
      });
    }
  }, [isOpen]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    // Fetch all relevant streams
    const [complaintsRes, creditsRes, consumptionRes] = await Promise.all([
      supabase.from('complaints').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('water_consumption').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    ]);

    const allEvents: Notification[] = [];

    // 1. Process Credits
    creditsRes.data?.forEach(tx => {
      allEvents.push({
        id: `credit-${tx.id}`,
        title: tx.amount > 0 ? 'Credits Awarded' : 'Credit Penalty',
        description: tx.reason,
        type: 'credit',
        timestamp: new Date(tx.created_at).getTime(),
        time: formatTime(tx.created_at),
        colorClass: tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400',
        icon: tx.amount > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
      });
    });

    // 2. Process Complaints
    complaintsRes.data?.forEach(c => {
      allEvents.push({
        id: `complaint-${c.id}`,
        title: `Issue: ${c.title}`,
        description: `Current Stage: ${c.status.toUpperCase()}`,
        type: 'complaint',
        status: c.status,
        timestamp: new Date(c.created_at).getTime(),
        time: formatTime(c.created_at),
        colorClass: c.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400',
        icon: c.status === 'resolved' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />
      });
    });

    // 3. Process Consumption
    consumptionRes.data?.forEach(cons => {
      allEvents.push({
        id: `water-${cons.id}`,
        title: 'Consumption Logged',
        description: `Your entry of ${cons.amount}L has been recorded.`,
        type: 'water',
        timestamp: new Date(cons.created_at).getTime(),
        time: formatTime(cons.created_at),
        colorClass: 'text-sky-400',
        icon: <Droplets className="w-4 h-4" />
      });
    });

    // Sort by most recent
    const sorted = allEvents.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(sorted);
    setHasUnread(sorted.length > 0);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel('unified-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints', filter: `user_id=eq.${user.id}` }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_transactions', filter: `user_id=eq.${user.id}` }, fetchNotifications)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'water_consumption', filter: `user_id=eq.${user.id}` }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setHasUnread(false);
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:border-[#38bdf8]/30 transition-all active:scale-95 group"
      >
        <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        {hasUnread && (
          <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,1)] animate-pulse" />
        )}
      </button>

      <div
        ref={dropdownRef}
        className="absolute right-0 mt-6 w-96 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/95 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 origin-top-right"
        style={{ display: 'none' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <h3 className="text-sm font-black tracking-[0.2em] text-white uppercase">Neural Feed</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center text-white/20 hover:bg-white/5 hover:text-white transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[32rem] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4 opacity-20">
              <ClipboardList className="h-12 w-12" />
              <p className="text-[10px] font-black tracking-widest uppercase">No data streams active</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="group p-5 border-b border-white/5 hover:bg-white/[0.03] transition-all cursor-default relative overflow-hidden"
              >
                <div className="flex gap-5 relative z-10">
                  <div className={cn(
                    "mt-1 h-10 w-10 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-current transition-colors shadow-inner",
                    n.colorClass
                  )}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors truncate">
                        {n.title}
                      </h4>
                      <span className="text-[9px] font-bold text-white/20 whitespace-nowrap uppercase tracking-tighter">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 group-hover:text-white/60 transition-colors">
                      {n.description}
                    </p>
                    {n.status && (
                      <div className="mt-2.5 inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-white/40 border border-white/5 group-hover:border-[#38bdf8]/20 transition-all">
                        {n.status}
                      </div>
                    )}
                  </div>
                </div>
                {/* Background Accent */}
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-full",
                  n.colorClass.replace('text-', 'bg-')
                )} />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/[0.02] text-center border-t border-white/5">
          <button className="text-[9px] font-black tracking-[0.3em] text-[#38bdf8] hover:text-white transition-colors uppercase py-2 w-full">
            Archive Neural Data
          </button>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.2); }
      `}</style>
    </div>
  );
}
