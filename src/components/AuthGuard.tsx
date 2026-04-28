"use client";

import { useAuth } from "./AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname === "/login" || pathname === "/";

  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      router.push("/login");
    }
  }, [user, isLoading, router, pathname, isPublicRoute]);

  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#38bdf8]/30 border-t-[#38bdf8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoading && !user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
