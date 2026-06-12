import { useTheme } from "../context/ThemeContext";
import { HiSun, HiMoon, HiDesktopComputer } from "react-icons/hi";

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  const buttons = [
    { name: "light", icon: HiSun },
    { name: "dark", icon: HiMoon },
    { name: "system", icon: HiDesktopComputer },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center transition-colors">
      <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        ResearchMind
      </h1>
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {buttons.map((b) => (
          <button
            key={b.name}
            onClick={() => setTheme(b.name)}
            className={`p-2 rounded-md transition-all ${
              theme === b.name
                ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <b.icon size={20} />
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
