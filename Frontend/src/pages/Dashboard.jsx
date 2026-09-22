import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "../context/AuthContext";
import { useReports } from "../hooks/useReports";
import api from "../api/axios";
import StepCard from "../components/StepCard";
import ReportPanel from "../components/ReportPanel";
import Agent3DCanvas from "../components/Agent3DCanvas";
import CopyButton from "../components/CopyButton";
import { HiLogout, HiExternalLink } from "react-icons/hi";
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
  const socketRef = useRef(null);
  const { user, getToken, logout } = useAuth();
  const { createChat, runResearch } = useReports();

  const handleStatusMessage = useCallback((msg) => {
    setAgentSteps((prev) => {
      const next = {
        search: "waiting",
        reader: "waiting",
        writer: "waiting",
        critic: "waiting",
      };
      if (msg.includes("STEP-1")) return { ...next, search: "running" };
      if (msg.includes("STEP-2"))
        return { ...next, search: "done", reader: "running" };
      if (msg.includes("STEP-3"))
        return { ...next, search: "done", reader: "done", writer: "running" };
      if (msg.includes("STEP-4"))
        return {
          ...next,
          search: "done",
          reader: "done",
          writer: "done",
          critic: "running",
        };
      return prev;
    });
  }, []);

  // Connect native WebSocket to FastAPI server
  useEffect(() => {
    if (!chatId) return;

    let ws = null;
    const connectWS = async () => {
      try {
        const token = (await getToken()) || "";
        const wsUrl = `${
          import.meta.env.VITE_WS_URL || "ws://localhost:8000"
        }/ws/research/${chatId}?token=${encodeURIComponent(token)}`;

        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log(`[WEBSOCKET] Connected to FastAPI chat session ${chatId}`);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === "research-status") {
              handleStatusMessage(payload.data?.message || "");
            } else if (payload.event === "research-complete") {
              const resData = payload.data?.data;
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.role === "ai") return prev;
                return [...prev, { role: "ai", content: JSON.stringify(resData) }];
              });
              setIsSearching(false);
              setAgentSteps({
                search: "done",
                reader: "done",
                writer: "done",
                critic: "done",
              });
            } else if (payload.event === "research-error") {
              setIsSearching(false);
            }
          } catch (e) {
            console.error("[WS MESSAGE PARSE ERROR]", e);
          }
        };

        ws.onclose = () => {
          console.log("[WEBSOCKET] Connection closed.");
        };
      } catch (err) {
        console.error("[WS CONNECT ERROR]", err);
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
    };
  }, [chatId, getToken, handleStatusMessage]);

  useEffect(() => {
    if (!chatId) {
      localStorage.removeItem("lastVisitedChat");
      setMessages([]);
      setAgentSteps({
        search: "waiting",
        reader: "waiting",
        writer: "waiting",
        critic: "waiting",
      });
      return;
    }

    localStorage.setItem("lastVisitedChat", chatId);

    const fetchChat = async () => {
      try {
        const { data } = await api.get(`/chat/${chatId}`);
        setMessages(data.messages || []);

        if (data.messages && data.messages.length > 0) {
          setAgentSteps({
            search: "done",
            reader: "done",
            writer: "done",
            critic: "done",
          });
        }
      } catch (err) {
        console.error("Chat fetch error:", err);
        if (err.response?.status === 404) {
          localStorage.removeItem("lastVisitedChat");
          navigate("/dashboard");
        }
      }
    };

    fetchChat();
  }, [chatId, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSearching]);

  const handleRun = async () => {
    if (!topic.trim() || isSearching) return;
    setIsSearching(true);
    const currentTopic = topic;
    setTopic("");

    setMessages((prev) => [...prev, { role: "user", content: currentTopic }]);
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

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: "start_research",
          topic: currentTopic,
        })
      );
    } else {
      await runResearch.mutateAsync({ topic: currentTopic, chatId: targetId });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    }
  };

  const markdownComponents = {
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[#526D82] hover:text-[#3E5466] underline font-bold transition-colors cursor-pointer"
      >
        <span>{children}</span>
        <HiExternalLink className="inline text-xs" />
      </a>
    ),
    p: ({ children }) => <p className="my-2.5 leading-relaxed text-[#27374D]">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside space-y-2 my-2.5 text-[#27374D]">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 my-2.5 text-[#27374D]">{children}</ol>,
    li: ({ children }) => <li className="ml-2 font-medium">{children}</li>,
    strong: ({ children }) => <strong className="font-extrabold text-[#27374D]">{children}</strong>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-3 rounded-xl border border-[#9DB2BF] bg-white">
        <table className="w-full border-collapse text-xs text-[#27374D]">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-[#DDE6ED] border-b border-[#9DB2BF] text-[#27374D] font-bold">{children}</thead>,
    th: ({ children }) => <th className="p-2.5 text-left border-r border-[#9DB2BF] last:border-0">{children}</th>,
    td: ({ children }) => <td className="p-2.5 border-t border-r border-[#9DB2BF] last:border-0 hover:bg-[#DDE6ED]/60">{children}</td>,
    code: ({ children }) => (
      <code className="bg-[#DDE6ED] px-2 py-0.5 rounded text-[#27374D] font-mono text-xs border border-[#9DB2BF] font-semibold">
        {children}
      </code>
    ),
  };

  const renderAiContent = (content) => {
    try {
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      if (parsed.is_direct_chat) {
        return (
          <div className="group relative bg-white border border-[#9DB2BF]/60 p-5 md:p-6 rounded-2xl text-[#27374D] text-sm leading-relaxed shadow-sm my-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#9DB2BF]/40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#526D82]" />
                <span className="text-xs font-bold text-[#526D82] uppercase tracking-wider">
                  ResearchMind AI Response
                </span>
              </div>
              <CopyButton text={parsed.response} />
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {parsed.response}
            </ReactMarkdown>
          </div>
        );
      }
      return <ReportPanel report={parsed} />;
    } catch (e) {
      return (
        <div className="group relative bg-white border border-[#9DB2BF]/60 p-5 md:p-6 rounded-2xl text-[#27374D] text-sm leading-relaxed shadow-sm my-4">
          <div className="flex justify-end pb-2">
            <CopyButton text={content} />
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#DDE6ED] text-[#27374D] transition-colors duration-300 overflow-hidden">
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {/* Top Header */}
        <div className="w-full p-4 px-6 flex justify-between items-center bg-white border-b border-[#9DB2BF]/60 shadow-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#526D82] animate-pulse" />
            <span className="text-xs font-bold text-[#526D82] tracking-wide">
              FastAPI Engine Connected
            </span>
          </div>
          <button
            onClick={() => logout(navigate)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-[#526D82] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            <HiLogout size={16} /> Logout
          </button>
        </div>

        {/* Workspace Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-48 w-full no-scrollbar">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
            {messages.length === 0 && !isSearching ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto">
                {/* 3D Wireframe Canvas in Hero Welcome Screen */}
                <div className="w-full max-w-md">
                  <Agent3DCanvas isSearching={isSearching} />
                </div>
                <div className="space-y-2 max-w-md">
                  <h2 className="text-3xl font-black text-[#27374D] tracking-tight">
                    Welcome, {user?.fullName || "Researcher"}!
                  </h2>
                  <p className="text-[#526D82] text-sm leading-relaxed font-medium">
                    Ask any question directly in English, Hindi, or Gujarati, or type a complex topic to trigger 
                    your multi-agent research engine.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className="mb-6">
                    {m.role === "user" ? (
                      <div className="flex justify-end">
                        {/* Solid color button/bubble - No Gradients */}
                        <div className="bg-[#526D82] text-[#DDE6ED] p-3.5 px-5 rounded-2xl text-sm font-semibold shadow-md max-w-xl">
                          {m.content}
                        </div>
                      </div>
                    ) : (
                      renderAiContent(m.content)
                    )}
                  </div>
                ))}
                {isSearching && (
                  <div className="space-y-2.5 mb-6">
                    <StepCard
                      num="01"
                      title="Search Agent (Tavily)"
                      state={agentSteps.search}
                    />
                    <StepCard
                      num="02"
                      title="Reader & Vectorizer Agent (Cohere Embeddings)"
                      state={agentSteps.reader}
                    />
                    <StepCard
                      num="03"
                      title="Writer Chain (Cohere Command-R+)"
                      state={agentSteps.writer}
                    />
                    <StepCard
                      num="04"
                      title="Critic Chain (Evaluation & Self-Correction)"
                      state={agentSteps.critic}
                    />
                  </div>
                )}
                <div ref={scrollRef} className="h-10" />
              </>
            )}
          </div>
        </div>

        {/* Input Container */}
        <div className="w-full p-4 md:p-6 bg-white/90 border-t border-[#9DB2BF]/60 shrink-0 backdrop-blur-md">
          <div className="max-w-3xl mx-auto flex gap-2.5 items-center">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-3.5 md:p-4 bg-[#F4F7F9] rounded-2xl outline-none border border-[#9DB2BF] focus:border-[#526D82] text-[#27374D] placeholder-[#526D82]/70 transition-all text-sm md:text-base font-medium shadow-inner"
              placeholder="Ask anything (e.g. hello kem cho, or Quantum Computing advances in 2026)..."
            />
            {/* Solid color Send Button - No Gradients */}
            <button
              onClick={handleRun}
              disabled={isSearching}
              className="bg-[#526D82] hover:bg-[#3E5466] disabled:opacity-50 px-6 py-3.5 md:py-4 rounded-2xl font-bold text-white transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
            >
              <IoRocketSharp size={18} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
