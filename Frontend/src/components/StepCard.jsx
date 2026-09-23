import { HiSearch, HiBookOpen, HiPencilAlt, HiBadgeCheck } from "react-icons/hi";
import { FaCircleNotch } from "react-icons/fa";

const StepCard = ({ num, title, state }) => {
  const getIcon = () => {
    switch (num) {
      case "01":
        return <HiSearch className="text-[#E85A4F]" size={18} />;
      case "02":
        return <HiBookOpen className="text-[#E85A4F]" size={18} />;
      case "03":
        return <HiPencilAlt className="text-[#e27870]" size={18} />;
      case "04":
        return <HiBadgeCheck className="text-[#E85A4F]" size={18} />;
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
          ? "bg-white border-[#E85A4F] shadow-md scale-[1.01]"
          : isDone
          ? "bg-[#EAE7DC] border-[#D8C3A5] text-[#3D3133]"
          : "bg-white/60 border-[#D8C3A5]/50 opacity-70 text-[#726363]"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
            isRunning
              ? "bg-[#EAE7DC] border-[#E85A4F]"
              : isDone
              ? "bg-white border-[#D8C3A5]"
              : "bg-white border-[#D8C3A5]/50"
          }`}
        >
          {getIcon()}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-[#E85A4F] uppercase">
            Phase {num}
          </span>
          <span className="text-sm font-bold text-[#3D3133] tracking-tight">
            {title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E85A4F] text-white text-xs font-bold shadow-xs">
            <FaCircleNotch className="animate-spin text-white text-xs" />
            <span>Processing</span>
          </div>
        )}
        {isDone && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e27870]/20 text-[#3D3133] border border-[#E85A4F]/40 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E85A4F]" />
            <span>Completed</span>
          </div>
        )}
        {!isRunning && !isDone && (
          <span className="text-xs font-semibold text-[#726363] px-2 py-1">
            Standby
          </span>
        )}
      </div>
    </div>
  );
};

export default StepCard;
