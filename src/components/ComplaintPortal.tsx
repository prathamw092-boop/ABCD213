'use client';

import React, { useState, useRef } from 'react';
import { MessageSquarePlus, X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ComplaintPortal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    if (isOpen) {
      const tl = gsap.timeline();
      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
        display: 'block',
      })
      .fromTo(modalRef.current, 
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power4.out' },
        '-=0.1'
      );
    } else {
      gsap.to(modalRef.current, {
        y: 20,
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        display: 'none',
        delay: 0.1,
      });
    }
  }, [isOpen]);

  // Pulse animation for the FAB
  useGSAP(() => {
    gsap.to(buttonRef.current, {
      boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'sine.inOut'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          user_id: user?.id || null,
          title,
          description,
          category,
          status: 'pending'
        });

      if (error) throw error;

      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        formRef.current?.reset();
      }, 2000);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 group glow-emerald"
        aria-label="Raise a complaint"
      >
        <MessageSquarePlus className="h-6 w-6 transition-transform group-hover:rotate-12" />
        <span className="absolute -top-12 right-0 hidden rounded-md bg-slate-900 px-3 py-1 text-xs whitespace-nowrap text-white group-hover:block">
          Raise Complaint
        </span>
      </button>

      {/* Portal Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[60] hidden bg-slate-950/60 backdrop-blur-sm opacity-0"
        onClick={() => !isSubmitting && setIsOpen(false)}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="fixed bottom-24 right-6 z-[70] w-[calc(100vw-3rem)] max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl opacity-0 pointer-events-none"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Report a Fault</h2>
            <p className="text-sm text-slate-400">Our team will investigate immediately.</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-4 rounded-full bg-emerald-500/20 p-4 text-emerald-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-white">Complaint Received</h3>
            <p className="mt-2 text-sm text-slate-400">
              Thank you for your report. We have assigned a technician to look into this.
            </p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-slate-300">
                Issue Title
              </label>
              <input
                id="title"
                name="title"
                required
                placeholder="e.g., Water leakage in Main St."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-slate-300">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-emerald-500 outline-none appearance-none"
              >
                <option value="leakage">Leakage / Burst Pipe</option>
                <option value="quality">Water Quality Issue</option>
                <option value="shortage">No Water Supply</option>
                <option value="billing">Billing Discrepancy</option>
                <option value="other">Other Fault</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-300">
                Detailed Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe the exact location and nature of the fault..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500">
                <AlertCircle className="h-4 w-4" />
                <p>Something went wrong. Please try again.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
