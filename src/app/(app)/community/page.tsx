export default function Community() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">Analytics</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Deep dive into resource utilization, trends, and ghost gaps across the community.
        </p>
      </header>
      <div className="h-96 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-slate-900/50 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 shadow-lg">
             <span className="text-emerald-400 font-mono">Chart</span>
          </div>
          <span className="text-slate-400 font-medium">Recharts implementation coming soon</span>
        </div>
      </div>
    </div>
  );
}
