import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthGuard } from "@/components/AuthGuard";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
export const metadata: Metadata = {
  title: "JalSakshi",
  description: "Community resource management and analytics platform.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased dark ${inter.variable} ${outfit.variable}`}>
      <body className="min-h-full bg-slate-950 text-slate-100">
        <AuthProvider>
          <AuthGuard>
            <SmoothScroll>
              <Navbar />
              {children}
            </SmoothScroll>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}