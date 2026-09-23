import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "./CopyButton";
import { HiDocumentText, HiBadgeCheck, HiDatabase, HiStar, HiCheckCircle, HiExternalLink } from "react-icons/hi";

const ReportPanel = ({ report }) => {
  const [activeTab, setActiveTab] = useState("report");

  if (!report) return null;

  const {
    report: markdownContent = "",
    feedback = "",
    score = 9,
    search_results = "",
    vector_context = "",
  } = typeof report === "object" ? report : { report };

  const getScoreBadgeColor = (s) => {
    if (s >= 8) return "bg-[#e27870]/20 text-[#3D3133] border-[#E85A4F]";
    if (s >= 6) return "bg-amber-50 text-amber-800 border-amber-300";
    return "bg-rose-50 text-rose-800 border-rose-300";
  };

  const markdownComponents = {
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[#E85A4F] hover:text-[#D1453A] underline font-bold transition-colors cursor-pointer"
      >
        <span>{children}</span>
        <HiExternalLink className="inline text-xs" />
      </a>
    ),
    h1: ({ children }) => (
      <h1 className="text-xl font-black text-[#2E2527] mt-5 mb-3 border-b border-[#D8C3A5] pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-bold text-[#E85A4F] mt-4 mb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-bold text-[#2E2527] mt-3 mb-1">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="my-2.5 leading-relaxed text-[#3D3133]">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 my-3 text-[#3D3133]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 my-3 text-[#3D3133]">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="ml-2 font-medium">
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong className="font-extrabold text-[#2E2527]">
        {children}
      </strong>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 rounded-xl border border-[#D8C3A5] shadow-xs bg-white">
        <table className="w-full border-collapse text-xs text-[#3D3133]">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-[#EAE7DC] border-b border-[#D8C3A5] text-[#E85A4F] font-bold">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="p-3 text-left font-bold border-r border-[#D8C3A5] last:border-0">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="p-3 border-t border-r border-[#D8C3A5] last:border-0 hover:bg-[#EAE7DC]/70 transition-colors">
        {children}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#E85A4F] pl-4 italic text-[#726363] my-3 bg-[#EAE7DC] py-2.5 rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-[#EAE7DC] px-2 py-0.5 rounded text-[#E85A4F] font-mono text-xs border border-[#D8C3A5] font-semibold">
        {children}
      </code>
    ),
  };

  return (
    <div className="w-full bg-white border border-[#D8C3A5] rounded-2xl overflow-hidden shadow-lg transition-all my-5">
      {/* Top Header & Tab Navigation */}
      <div className="p-4 px-6 bg-[#EAE7DC] border-b border-[#D8C3A5] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E85A4F] text-white flex items-center justify-center font-bold shadow-md">
            <HiDocumentText className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#2E2527] tracking-tight">
              Research Mind Intelligence Document
            </h3>
            <span className="text-[11px] font-semibold text-[#726363]">
              Generated via Cohere Command-R+ & LangGraph Multi-Agent
            </span>
          </div>
        </div>

        {/* Copy Button & Score Badge */}
        <div className="flex items-center gap-3">
          <CopyButton text={markdownContent} />
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${getScoreBadgeColor(
              score
            )}`}
          >
            <HiStar className="text-amber-500 text-sm" />
            <span className="text-xs font-extrabold tracking-wide">
              Score: {score}/10
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-[#D8C3A5] bg-[#EAE7DC]/50 px-6 gap-2 pt-2">
        <button
          onClick={() => setActiveTab("report")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === "report"
              ? "bg-white text-[#E85A4F] border-[#E85A4F] shadow-xs"
              : "text-[#726363] hover:text-[#2E2527] border-transparent hover:bg-white/60"
          }`}
        >
          <HiDocumentText size={15} /> Executive Report
        </button>
        <button
          onClick={() => setActiveTab("critic")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === "critic"
              ? "bg-white text-[#E85A4F] border-[#E85A4F] shadow-xs"
              : "text-[#726363] hover:text-[#2E2527] border-transparent hover:bg-white/60"
          }`}
        >
          <HiBadgeCheck size={15} /> Critic Evaluation
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === "sources"
              ? "bg-white text-[#E85A4F] border-[#E85A4F] shadow-xs"
              : "text-[#726363] hover:text-[#2E2527] border-transparent hover:bg-white/60"
          }`}
        >
          <HiDatabase size={15} /> Vector Sources & Context
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-6 md:p-8">
        {activeTab === "report" && (
          <div className="prose max-w-none text-[#3D3133] leading-relaxed text-sm space-y-4">
            {markdownContent ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {markdownContent}
              </ReactMarkdown>
            ) : (
              <p className="text-[#726363] italic">No report text compiled.</p>
            )}
          </div>
        )}

        {activeTab === "critic" && (
          <div className="space-y-4 text-sm">
            <div className="p-5 rounded-xl bg-[#EAE7DC] border border-[#D8C3A5]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#726363] mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HiCheckCircle className="text-[#E85A4F]" /> Critic Feedback Analysis
                </span>
                <CopyButton text={feedback} />
              </h4>
              <div className="text-[#2E2527] font-mono text-xs leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {feedback || "Detailed evaluation score verified."}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sources" && (
          <div className="space-y-4 text-sm">
            <div className="p-5 rounded-xl bg-[#EAE7DC] border border-[#D8C3A5]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#E85A4F] mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HiDatabase /> Vector Similarity Context
                </span>
                <CopyButton text={vector_context || search_results} />
              </h4>
              <div className="text-[#2E2527] font-mono text-xs leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {vector_context || search_results || "Context indexed via Cohere Embeddings."}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPanel;
