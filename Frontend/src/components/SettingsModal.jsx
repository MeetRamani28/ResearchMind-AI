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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-slate-900 w-[90%] max-w-lg min-h-[400px] max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl transition-all duration-300 overflow-hidden">
        {activeView !== "main" && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-slate-900 h-full w-full">
            {activeView === "profile" && (
              <EditProfileModal
                isOpen={true}
                onClose={() => setActiveView("main")}
              />
            )}
            {activeView === "upgrade" && (
              <UpgradeModal
                isOpen={true}
                onClose={() => setActiveView("main")}
              />
            )}
          </div>
        )}

        {activeView === "main" && (
          <div className="p-8 flex flex-col h-full">
            {" "}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Settings
              </h2>
              <button onClick={onClose}>
                <HiX
                  size={24}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                />
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setActiveView("profile")}
                className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-lg text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <HiUser className="text-indigo-500 text-xl" /> Edit Profile
                </div>
                <HiChevronRight />
              </button>

              <button
                onClick={() => setActiveView("upgrade")}
                className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-lg text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <HiCreditCard className="text-indigo-500 text-xl" /> Upgrade
                  Plan
                </div>
                <HiChevronRight />
              </button>

              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-bold mb-4 tracking-wider">
                  Appearance
                </p>
                <div className="flex gap-2 bg-slate-200 dark:bg-slate-950 p-1 rounded-xl">
                  {["light", "dark", "system"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 p-3 rounded-lg text-base flex items-center justify-center gap-2 capitalize transition-all ${
                        theme === t
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      {/* Icon */}
                      {t === "light" ? (
                        <HiSun />
                      ) : t === "dark" ? (
                        <HiMoon />
                      ) : (
                        <HiDesktopComputer />
                      )}

                      {/* Text: mobile (hidden) md:block (visible on larger screens) */}
                      <span className="hidden md:block">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SettingsModal;
