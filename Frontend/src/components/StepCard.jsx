import { HiMinusCircle, HiCheckCircle, HiRefresh } from "react-icons/hi";

const StepCard = ({ num, title, state }) => {
  const status = {
    waiting: {
      icon: (
        <HiMinusCircle
          className="text-slate-400 dark:text-gray-600 shrink-0"
          size={20}
        />
      ),
      styles:
        "border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-slate-900/50 opacity-60",
    },
    running: {
      icon: (
        <HiRefresh
          className="animate-spin text-orange-500 shrink-0"
          size={20}
        />
      ),
      styles: "border-orange-500 bg-orange-50/50 dark:bg-slate-900",
    },
    done: {
      icon: <HiCheckCircle className="text-green-500 shrink-0" size={20} />,
      styles: "border-green-500 bg-green-50/50 dark:bg-slate-900",
    },
  };

  const currentStatus = status[state] || status.waiting;

  return (
    <div
      className={`p-3 md:p-4 border rounded-xl flex justify-between items-center transition-all duration-300 gap-3 ${currentStatus.styles}`}
    >
      <span className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200 truncate">
        <span className="mr-2 opacity-70">{num}</span>
        {title}
      </span>
      {currentStatus.icon}
    </div>
  );
};

export default StepCard;
