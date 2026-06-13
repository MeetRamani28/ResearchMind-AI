import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useReports } from "../hooks/useReports";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSun,
  HiMoon,
  HiDesktopComputer,
  HiDotsVertical,
  HiLogout,
  HiMenu,
  HiX,
  HiPlus,
  HiChat,
} from "react-icons/hi";

const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const { chats, isHistoryLoading } = useReports();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 1024 && setIsOpen(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login");
      window.location.reload();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.error("Logout failed");
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden p-4 fixed top-0 left-0 z-50 text-slate-600 dark:text-slate-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <motion.div
        animate={{ x: isOpen ? 0 : window.innerWidth >= 1024 ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:static w-72 h-screen bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 z-50 shadow-2xl lg:shadow-none"
      >
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 mt-14 lg:mt-0 px-2">
          ResearchMind
        </h1>

        {/* New Chat Button */}
        <Link
          to="/dashboard"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition mb-6 shadow-lg shadow-indigo-500/20"
        >
          <HiPlus size={20} /> New Chat
        </Link>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <p className="text-[11px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">
            History
          </p>
          {isHistoryLoading ? (
            <div className="px-3 text-sm text-slate-500 animate-pulse">
              Loading...
            </div>
          ) : (
            chats?.map((chat) => (
              <Link
                key={chat._id}
                to={`/dashboard/${chat._id}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-all truncate ${
                  location.pathname.includes(chat._id)
                    ? "bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                <HiChat size={16} /> {chat.title || "Untitled Chat"}
              </Link>
            ))
          )}
        </div>

        {/* Bottom Section */}
        <div className="relative border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center justify-between w-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-all"
          >
            <span className="text-sm">
              Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </span>
            <HiDotsVertical />
          </button>

          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-16 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-2 z-50"
              >
                {[
                  { n: "light", i: HiSun },
                  { n: "dark", i: HiMoon },
                  { n: "system", i: HiDesktopComputer },
                ].map((opt) => (
                  <button
                    key={opt.n}
                    onClick={() => {
                      setTheme(opt.n);
                      setShowThemeMenu(false);
                    }}
                    className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-sm text-slate-700 dark:text-slate-300"
                  >
                    <opt.i size={18} />{" "}
                    {opt.n.charAt(0).toUpperCase() + opt.n.slice(1)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-2 text-sm transition-all"
          >
            <HiLogout size={18} /> Logout
          </button>
        </div>
      </motion.div>
    </>
  );
};
export default Sidebar;
