import { useState } from "react";
import {
  HiX,
  HiUser,
  HiCreditCard,
  HiChevronRight,
  HiSun,
  HiMoon,
  HiDesktopComputer,
} from "react-icons/hi";
import { useTheme } from "../context/ThemeContext";
import EditProfileModal from "./EditProfileModal";
import UpgradeModal from "./UpgradeModal";

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeView, setActiveView] = useState("main");
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      <EditProfileModal
        isOpen={activeView === "profile"}
        onClose={() => setActiveView("main")}
      />
      <UpgradeModal
        isOpen={activeView === "upgrade"}
        onClose={() => setActiveView("main")}
      />

      {activeView === "main" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-[90%] max-w-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl transition-colors duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Settings
              </h2>
              <button
                onClick={() => {
                  onClose();
                  setActiveView("main");
                }}
              >
                <HiX className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveView("profile")}
                className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm md:text-base"
              >
                <div className="flex items-center gap-2">
                  <HiUser className="text-indigo-500" /> Edit Profile
                </div>
                <HiChevronRight />
              </button>

              <button
                onClick={() => setActiveView("upgrade")}
                className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm md:text-base"
              >
                <div className="flex items-center gap-2">
                  <HiCreditCard className="text-indigo-500" /> Upgrade Plan
                </div>
                <HiChevronRight />
              </button>

              {/* Theme Section */}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-3">
                  Appearance
                </p>
                <div className="flex gap-1 bg-slate-200 dark:bg-slate-950 p-1 rounded-lg">
                  {["light", "dark", "system"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 p-2 md:p-3 rounded-lg text-sm flex justify-center transition-all ${
                        theme === t
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      {t === "light" ? (
                        <HiSun />
                      ) : t === "dark" ? (
                        <HiMoon />
                      ) : (
                        <HiDesktopComputer />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;
