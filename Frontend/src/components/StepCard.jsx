import { HiMinusCircle, HiCheckCircle, HiRefresh } from "react-icons/hi";

const StepCard = ({ num, title, state }) => {
  const status = {
    waiting: {
      icon: <HiMinusCircle className="text-gray-600" size={20} />,
      styles: "opacity-40 border-gray-600",
    },
    running: {
      icon: <HiRefresh className="animate-spin text-orange-500" size={20} />,
      styles: "border-orange-500",
    },
    done: { 
      icon: <HiCheckCircle className="text-green-500" size={20} />,
      styles: "border-green-500",
    },
  };

  const currentStatus = status[state] || status.waiting;

  return (
    <div
      className={`p-4 border rounded-xl flex justify-between items-center bg-slate-900/50 ${currentStatus.styles}`}
    >
      <span className="font-bold text-sm text-slate-200">
        {num} {title}
      </span>
      {currentStatus.icon}
    </div>
  );
};

export default StepCard;
