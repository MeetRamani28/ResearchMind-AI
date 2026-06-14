import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../hooks/useReports";
import api from "../api/axios";
import StepCard from "../components/StepCard";
import ReportPanel from "../components/ReportPanel";

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
  const { socket, user } = useAuth();
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
    <div className="flex h-screen bg-slate-950 text-white">
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
          {messages.map((m, i) => (
            <div key={i} className="max-w-4xl mx-auto">
              {m.role === "user" ? (
                <div className="bg-slate-800 p-4 rounded-xl mb-4">
                  {m.content}
                </div>
              ) : (
                <ReportPanel report={JSON.parse(m.content)} />
              )}
            </div>
          ))}
          {isSearching && (
            <div className="max-w-4xl mx-auto space-y-2">
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
          <div ref={scrollRef} />
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRun()}
              className="flex-1 p-4 bg-slate-900 rounded-2xl outline-none border border-slate-800 focus:border-indigo-500"
              placeholder="Ask anything..."
            />
            <button
              onClick={handleRun}
              className="bg-indigo-600 px-6 rounded-2xl font-bold"
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
