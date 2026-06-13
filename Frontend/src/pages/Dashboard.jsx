import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiSearch } from "react-icons/hi";

const Dashboard = () => {
  const [topic, setTopic] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const { socket } = useAuth();

  useEffect(() => {
    if (!socket) return;
    socket.on("research-status", (d) => setLogs((p) => [...p, d.message]));
    socket.on("research-complete", (d) => {
      setResult(d.data);
      setIsSearching(false);
    });
    socket.on("research-error", (d) => {
      setLogs((p) => [...p, `❌ ${d.message}`]);
      setIsSearching(false);
    });
    return () => {
      socket.off("research-status");
      socket.off("research-complete");
      socket.off("research-error");
    };
  }, [socket]);

  const handleRunResearch = async () => {
    if (!topic.trim()) return;
    setIsSearching(true);
    setLogs(["🚀 Initializing research..."]);
    setResult(null);

    try {
      // API call
      const response = await api.post("/research/run", { topic });
      if (response.data.success) {
        setResult(response.data.data);
        setIsSearching(false);
      }
    } catch {
      setLogs((p) => [...p, "❌ Connection failed."]);
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Start New Research
        </h2>
        <div className="flex gap-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter research topic..."
            className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none border border-transparent focus:border-indigo-500 transition-all"
          />
          <button
            onClick={handleRunResearch}
            disabled={isSearching}
            className="px-8 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {isSearching ? (
              "Processing..."
            ) : (
              <>
                <HiSearch className="inline mr-2" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {isSearching && (
        <div className="bg-slate-950 text-indigo-300 p-6 rounded-3xl font-mono text-sm shadow-2xl h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <p key={i}>
              <span className="text-indigo-600">$</span> {log}
            </p>
          ))}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
              <HiCheckCircle className="text-green-500" size={24} /> Research
              Summary
            </h3>
            <div className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.report || JSON.stringify(result, null, 2)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Dashboard;
