import { HiSearch, HiBookOpen, HiPencilAlt, HiBadgeCheck } from "react-icons/hi";
import { FaCircleNotch } from "react-icons/fa";

const StepCard = ({ num, title, state }) => {
  const getIcon = () => {
    switch (num) {
      case "01":
        return <HiSearch className="text-[#526D82]" size={18} />;
      case "02":
        return <HiBookOpen className="text-[#526D82]" size={18} />;
      case "03":
        return <HiPencilAlt className="text-[#9DB2BF]" size={18} />;
      case "04":
        return <HiBadgeCheck className="text-[#526D82]" size={18} />;
      default:
        return null;
    }
  };

  const isDone = state === "done";
  const isRunning = state === "running";

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 px-4 rounded-xl border transition-all duration-300 ${
        isRunning
          ? "bg-white border-[#526D82] shadow-md scale-[1.01]"
          : isDone
          ? "bg-[#DDE6ED] border-[#9DB2BF] text-[#27374D]"
          : "bg-white/60 border-[#9DB2BF]/50 opacity-70 text-[#526D82]"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
            isRunning
              ? "bg-[#DDE6ED] border-[#526D82]"
              : isDone
              ? "bg-white border-[#9DB2BF]"
              : "bg-white border-[#9DB2BF]/50"
          }`}
        >
          {getIcon()}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-[#526D82] uppercase">
            Phase {num}
          </span>
          <span className="text-sm font-bold text-[#27374D] tracking-tight">
            {title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#526D82] text-white text-xs font-bold shadow-xs">
            <FaCircleNotch className="animate-spin text-white text-xs" />
            <span>Processing</span>
          </div>
        )}
        {isDone && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9DB2BF]/30 text-[#27374D] border border-[#526D82]/40 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#526D82]" />
            <span>Completed</span>
          </div>
        )}
        {!isRunning && !isDone && (
          <span className="text-xs font-semibold text-[#526D82] px-2 py-1">
            Standby
          </span>
        )}
      </div>
    </div>
  );
};

export default StepCard;
