import { HiDocumentText, HiBadgeCheck } from "react-icons/hi";

const ReportPanel = ({ report }) => {
  if (!report) return null;

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full">
      <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 rounded-xl md:rounded-2xl p-4 md:p-6 transition-colors duration-300">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] md:text-xs uppercase mb-3 md:mb-4 border-b border-slate-200 dark:border-white/5 pb-2">
          <HiDocumentText className="w-4 h-4 shrink-0" />
          <span className="truncate">Compiled Research Report</span>
        </div>
        <div className="text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
          {report.report}
        </div>
      </div>

      {report.feedback && (
        <div className="border border-green-500/20 bg-green-50 dark:bg-green-950/10 rounded-xl mb-6 md:rounded-2xl p-4 md:p-6 transition-colors duration-300">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-mono text-[10px] md:text-xs uppercase mb-3 md:mb-4">
            <HiBadgeCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Critic Feedback</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-xs md:text-sm whitespace-pre-wrap font-mono">
            {report.feedback}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPanel;
