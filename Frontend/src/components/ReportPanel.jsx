import { HiDocumentText, HiBadgeCheck } from "react-icons/hi";

const ReportPanel = ({ report }) => {
  if (!report) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border border-white/10 bg-slate-900/50 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase mb-4 border-b border-white/5 pb-2">
          <HiDocumentText className="w-4 h-4" />{" "}
          <span>Compiled Research Report</span>
        </div>
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {report.report}
        </div>
      </div>

      {report.feedback && (
        <div className="border border-green-500/20 bg-green-950/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-green-400 font-mono text-xs uppercase mb-4">
            <HiBadgeCheck className="w-4 h-4" /> <span>Critic Feedback</span>
          </div>
          <div className="text-slate-400 text-sm whitespace-pre-wrap font-mono">
            {report.feedback}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPanel;
