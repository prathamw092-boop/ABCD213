"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Disabled @studio-freight/react-lenis temporarily due to React 19 compatibility issues
  // which causes the entire app to render a blank screen.
  return (
    <>
      {children}
    </>
  );
}
