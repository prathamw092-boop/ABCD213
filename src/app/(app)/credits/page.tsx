import { mockActivityLogs } from "@/mockData";

export default function Credits() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">The Bank</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Manage and review community resource credits, ledgers, and transactions.
        </p>
      </header>
      
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800">
          <h3 className="text-lg font-medium text-slate-200">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          {mockActivityLogs.slice(0, 10).map((log) => (
            <div key={log.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
              <div>
                <p className="text-slate-200 font-medium text-sm">{log.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{log.block}</span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-medium text-sm">+{log.units} <span className="text-xs opacity-70">cr</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
