import { mockResidentComments } from "@/mockData";

export default function Alerts() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">Resident Feedback</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Monitor and respond to community reports, issues, and active alerts.
        </p>
      </header>

      <div className="grid gap-4">
        {mockResidentComments.map((comment) => {
          const isWarning = comment.status === "open";
          const isMid = comment.status === "investigating";
          const isHealthy = comment.status === "fixed";
          
          return (
            <div key={comment.id} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-start gap-4 transition-all hover:border-slate-600">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
                    {comment.block}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{comment.message}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                  ${isWarning ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : ''}
                  ${isMid ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : ''}
                  ${isHealthy ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : ''}
                `}>
                  {comment.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
