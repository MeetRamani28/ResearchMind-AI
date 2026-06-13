import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../hooks/useReports";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiPlus } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const { chatId: urlChatId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const logsRef = useRef([]);
  const { socket } = useAuth();
  const { createChat } = useReports();

  // 1. URL chatId બદલાય ત્યારે ડેટા લોડ કરો
  useEffect(() => {
    const loadChat = async () => {
      setResult(null);
      setLogs([]);
      logsRef.current = [];

      if (urlChatId) {
        try {
          const { data } = await api.get(`/chat/history`);
          const chat = data.find((c) => c._id === urlChatId);
          if (chat?.messages?.length > 0) {
            const aiMsgs = chat.messages.filter((m) => m.role === "ai");
            if (aiMsgs.length > 0) {
              const lastMsg = aiMsgs[aiMsgs.length - 1];
              // Safe JSON parsing
              const content =
                typeof lastMsg.content === "string"
                  ? JSON.parse(lastMsg.content)
                  : lastMsg.content;
              setResult(content);
            }
          }
        } catch (err) {
          console.error("Chat load error:", err);
        }
      }
    };
    loadChat();
  }, [urlChatId]);

  // 2. Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleStatus = (d) => {
      // અહીં અમે સીધું ફંક્શનલ અપડેટ વાપરીએ છીએ જે લેટેસ્ટ સ્ટેટ આપે
      setLogs((prev) => [...prev, d.message]);
    };

    socket.on("research-status", handleStatus);
    socket.on("research-complete", (d) => {
      setResult(d.data);
      setIsSearching(false);
      queryClient.invalidateQueries(["chats"]);
    });
    socket.on("research-error", (d) => {
      setLogs((prev) => [...prev, `❌ ${d.message}`]);
      setIsSearching(false);
    });

    return () => {
      socket.off("research-status", handleStatus);
      socket.off("research-complete");
      socket.off("research-error");
    };
  }, [socket, queryClient]);

  const handleRunResearch = async () => {
    if (!topic.trim()) return;

    let currentId = urlChatId;
    if (!currentId) {
      const chat = await createChat.mutateAsync();
      currentId = chat.data._id;
      navigate(`/dashboard/${currentId}`);
    }

    setIsSearching(true);
    logsRef.current = ["🚀 Initializing research pipeline..."];
    setLogs(logsRef.current);
    setResult(null);

    try {
      await api.post("/research/run", { topic, chatId: currentId });
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        "❌ " + (err.response?.data?.message || "Failed"),
      ]);
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Research Agent</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition"
        >
          <HiPlus /> New Chat
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
        <div className="flex gap-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunResearch()}
            className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-transparent outline-none"
            placeholder="Enter topic..."
          />
          <button
            onClick={handleRunResearch}
            disabled={isSearching}
            className="px-8 bg-indigo-600 text-white rounded-xl font-bold"
          >
            {isSearching ? "Processing..." : "Analyze"}
          </button>
        </div>
      </div>

      {isSearching && (
        <div className="bg-slate-950 text-indigo-300 p-6 rounded-3xl font-mono text-sm h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <p key={i} className="mb-1 border-l-2 border-indigo-900 pl-2">
              $ {log}
            </p>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={urlChatId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border dark:border-slate-800 shadow-xl"
          >
            <h3 className="text-xl font-bold mb-6 dark:text-white">
              <HiCheckCircle className="text-green-500 inline" /> Research
              Summary
            </h3>
            <div className="whitespace-pre-wrap dark:text-slate-300">
              {result.report || JSON.stringify(result, null, 2)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Dashboard;
