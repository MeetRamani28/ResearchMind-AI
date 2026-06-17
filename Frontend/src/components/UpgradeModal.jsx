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

  const handleUpgrade = async (plan) => {
    try {
      const { data } = await api.post("/payment/create-order", {
        plan: plan.name,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: data.order.amount,

        currency: "INR",

        name: "ResearchMind AI",

        description: `Upgrade to ${plan.name} Plan`,

        order_id: data.order.id,

        notes: {
          address: "India",
        },

        prefill: {
          name: "User Name",

          email: "user@example.com",

          contact: "9999999999",
        },

        method: {
          card: true,

          upi: true,

          netbanking: true,
        },

        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",

                instruments: [{ method: "upi" }],
              },
            },
          },
        },

        handler: async function (response) {
          try {
            await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,

              plan: plan.name,
            });

            alert("Plan upgraded successfully!");

            window.location.reload();

            // eslint-disable-next-line no-unused-vars
          } catch (err) {
            alert("Payment verification failed!");
          }
        },

        theme: { color: "#4f46e5" },

        modal: {
          confirm_close: true,

          animation: true,
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.open();

      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Order creation failed!");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="sticky top-0 float-right text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white z-10 p-2"
        >
          <HiX size={24} />
        </button>

        <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white text-center mb-6 md:mb-8 pt-4">
          Choose Your Research Power
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {plans.map((p) => (
            <div
              key={p.name}
              className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-5 md:p-6 rounded-3xl flex flex-col hover:border-indigo-500 transition-all duration-300"
            >
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white text-center mb-4">
                {p.name}
              </h3>

              <div className="text-center mb-6">
                <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                  ${p.price}
                </span>
                <span className="text-slate-500 text-sm">/mo</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f, i) => (
                  <li
                    key={i}
                    className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-3"
                  >
                    <HiCheck className="text-indigo-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(p)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 md:py-4 rounded-2xl text-white font-bold transition-all"
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
