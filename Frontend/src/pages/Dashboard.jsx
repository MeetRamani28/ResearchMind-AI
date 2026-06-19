import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../hooks/useReports";
import api from "../api/axios";
import StepCard from "../components/StepCard";
import ReportPanel from "../components/ReportPanel";
import { HiLogout } from "react-icons/hi";
import { IoRocketSharp } from "react-icons/io5";

const Dashboard = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState([]);
  const [agentSteps, setAgentSteps] = useState({
    search: "waiting",
    reader: "waiting",
    writer: "waiting",
    critic: "waiting",
  });

  const scrollRef = useRef(null);
  const { socket, user, logout } = useAuth();
  const { createChat, runResearch } = useReports();

  useEffect(() => {
    if (chatId) {
      api.get(`/chat/${chatId}`).then(({ data }) => {
        setMessages(data.messages || []);
        setAgentSteps({
          search: "done",
          reader: "done",
          writer: "done",
          critic: "done",
        });
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([]);
      setAgentSteps({
        search: "waiting",
        reader: "waiting",
        writer: "waiting",
        critic: "waiting",
      });
    }
  }, [chatId]);

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit("join", user._id);
    const handleStatus = (d) => {
      const msg = d.message || "";
      if (msg.includes("STEP-1"))
        setAgentSteps((p) => ({ ...p, search: "running" }));
      if (msg.includes("STEP-2"))
        setAgentSteps((p) => ({ ...p, search: "done", reader: "running" }));
      if (msg.includes("STEP-3"))
        setAgentSteps((p) => ({ ...p, reader: "done", writer: "running" }));
      if (msg.includes("STEP-4"))
        setAgentSteps((p) => ({ ...p, writer: "done", critic: "running" }));
    };
    const handleComplete = (d) => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: JSON.stringify(d.data) },
      ]);
      setIsSearching(false);
      setAgentSteps({
        search: "done",
        reader: "done",
        writer: "done",
        critic: "done",
      });
    };
    socket.on("research-status", handleStatus);
    socket.on("research-complete", handleComplete);
    return () => {
      socket.off("research-status", handleStatus);
      socket.off("research-complete", handleComplete);
    };
  }, [socket, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRun = async () => {
    if (!topic.trim() || isSearching) return;
    setIsSearching(true);
    setMessages((prev) => [...prev, { role: "user", content: topic }]);
    setAgentSteps({
      search: "running",
      reader: "waiting",
      writer: "waiting",
      critic: "waiting",
    });
    let targetId = chatId;
    if (!targetId) {
      const res = await createChat.mutateAsync();
      targetId = res.data._id;
      navigate(`/dashboard/${targetId}`);
    }
    await runResearch.mutateAsync({ topic, chatId: targetId });
    setTopic("");
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        <div className="w-full p-4 flex justify-end items-center bg-transparent">
          <button
            onClick={() => logout(navigate)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <HiLogout size={16} /> Logout
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 min-h-0">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
            {messages.length === 0 && !isSearching ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                  <IoRocketSharp size={30} />
                </div>
                <h2 className="text-2xl font-bold">
                  Welcome, {user?.fullName || "User"}!
                </h2>
                <p className="max-w-xs text-slate-500 dark:text-slate-400">
                  How can I help you with your research today? Start by typing a
                  topic below.
                </p>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className="mb-6">
                    {m.role === "user" ? (
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-slate-900 dark:text-slate-200">
                        {m.content}
                      </div>
                    ) : (
                      <ReportPanel report={JSON.parse(m.content)} />
                    )}
                  </div>
                ))}

                {isSearching && (
                  <div className="space-y-2 mb-6">
                    <StepCard
                      num="01"
                      title="Search Agent"
                      state={agentSteps.search}
                    />
                    <StepCard
                      num="02"
                      title="Reader Agent"
                      state={agentSteps.reader}
                    />
                    <StepCard
                      num="03"
                      title="Writer Chain"
                      state={agentSteps.writer}
                    />
                    <StepCard
                      num="04"
                      title="Critic Chain"
                      state={agentSteps.critic}
                    />
                  </div>
                )}
                <div ref={scrollRef} className="h-4" />
              </>
            )}
          </div>
        </div>

        <div className="w-full p-4 md:p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRun()}
              className="flex-1 p-3 md:p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
              placeholder="Ask anything..."
            />
            <button
              onClick={handleRun}
              className="bg-indigo-600 hover:bg-indigo-700 px-6 rounded-2xl font-bold text-white transition-all"
            >
              Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
