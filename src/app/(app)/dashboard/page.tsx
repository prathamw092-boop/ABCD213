import { mockBlocks } from "@/mockData";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">The Face</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Real-time overview of Kambi Ward's community resource blocks. Monitor usage, health, and trust scores.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBlocks.map((block) => {
          const isWarning = block.currentUsage > block.target;
          return (
            <div 
              key={block.id} 
              className={`bg-slate-800/80 backdrop-blur-sm border rounded-xl p-6 shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isWarning ? 'border-rose-500/30 hover:border-rose-500/50' : 'border-slate-700 hover:border-emerald-500/30'}`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isWarning ? 'from-rose-500' : 'from-emerald-400'} to-transparent opacity-50`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-slate-200">{block.name}</h3>
                <span className="text-xs text-slate-500">{block.lastReported}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-slate-400">Current Usage</span>
                    <span className={`text-sm font-semibold ${isWarning ? 'text-rose-400' : 'text-slate-200'}`}>
                      {block.currentUsage} <span className="text-slate-500 font-normal">/ {block.target}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 shadow-inner overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isWarning ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`} 
                      style={{ width: `${Math.min((block.currentUsage / block.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Trust Score</span>
                    <span className="text-emerald-400 font-medium text-lg">{block.trustScore}%</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Credits</span>
                    <span className="text-amber-400 font-medium text-lg">{block.creditsEarned}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
