import { HiX, HiCheck } from "react-icons/hi";
import api from "../api/axios";

const UpgradeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: "BASIC",
      price: "19",
      role: "RESEARCHER",
      features: ["50 Prompts/day", "Basic Research", "Standard Support"],
    },
    {
      name: "PRO",
      price: "49",
      role: "RESEARCHER",
      features: ["100 Prompts/day", "Advanced Research", "Priority Support"],
    },
    {
      name: "ENTERPRISE",
      price: "99",
      role: "RESEARCHER",
      features: ["500 Prompts/day", "Deep Research", "Dedicated Support"],
    },
  ];

  const handleUpgrade = async (planName, role) => {
    try {
      await api.patch("/auth/upgrade-plan", { plan: planName, role: role });
      alert(`Successfully upgraded to ${planName} plan!`);
      window.location.reload();
      onClose();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Upgrade failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl relative transition-colors duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <HiX size={24} />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center mb-8">
          Choose Your Research Power
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl flex flex-col hover:border-indigo-500 dark:hover:border-indigo-500 transition-all"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                {p.name}
              </h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white text-center my-6">
                ${p.price}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                  /mo
                </span>
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f, i) => (
                  <li
                    key={i}
                    className="text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2"
                  >
                    <HiCheck className="text-indigo-500" /> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(p.name, p.role)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-white font-bold transition-all"
              >
                Select {p.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
