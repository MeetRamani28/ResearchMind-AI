import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSun,
  HiMoon,
  HiDesktopComputer,
  HiDotsVertical,
  HiLightningBolt,
  HiViewGrid,
  HiLogout,
  HiMenu,
  HiX,
} from "react-icons/hi";

const Sidebar = () => {
  const { theme, setTheme } = useTheme();
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
      <button
        className="lg:hidden p-4 fixed top-0 left-0 z-50 text-slate-600 dark:text-slate-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div
        animate={{ x: isOpen ? 0 : window.innerWidth >= 1024 ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:static w-64 h-screen bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 z-50 shadow-2xl lg:shadow-none"
      >
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 mt-14 lg:mt-0">
          ResearchMind
        </h1>

        <nav className="space-y-2 mb-auto">
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
              location.pathname === "/dashboard"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <HiViewGrid size={20} /> Dashboard
          </Link>
        </nav>

        <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition mb-4 shadow-lg shadow-indigo-500/30">
          <HiLightningBolt /> Become a Researcher
        </button>

        <div className="relative border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center justify-between w-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
          >
            <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
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
                    className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
                  >
                    <opt.i /> {opt.n.charAt(0).toUpperCase() + opt.n.slice(1)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-2 transition-all"
          >
            <HiLogout /> Logout
          </button>
        </div>
      </motion.div>
    </>
  );
};
export default Sidebar;
