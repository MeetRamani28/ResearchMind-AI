import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useReports } from "../hooks/useReports";
import { useAuth } from "../context/AuthContext";
import SettingsModal from "./SettingsModal";
import UpgradeModal from "./UpgradeModal";
import {
  HiDotsVertical,
  HiPlus,
  HiTrash,
  HiPencil,
  HiCheck,
  HiCog,
  HiMenu,
  HiX,
} from "react-icons/hi";

const Sidebar = () => {
  const { chats, updateChat, deleteChat } = useReports();
  const { user } = useAuth();
  const location = useLocation();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuId, setMenuId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuId && !e.target.closest(".chat-item-container")) setMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuId]);

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-[100] p-2 bg-slate-800 text-white rounded-lg"
      >
        {isMobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-[90]"
        />
      )}

      <div
        className={`fixed md:relative z-[95] w-72 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2 shrink-0 mt-10 md:mt-0">
          ResearchMind
        </h1>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onUpgrade={() => {
            setShowSettings(false);
            setShowUpgrade(true);
          }}
        />

        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
        />

        <Link
          to="/dashboard"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-2 w-full bg-indigo-600 text-white p-3 rounded-xl font-bold mb-6 hover:bg-indigo-700 transition-all shrink-0"
        >
          <HiPlus size={20} /> New Chat
        </Link>

        <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
          {chats?.map((chat) => (
            <div
              key={chat._id}
              className="chat-item-container group relative flex items-center mb-1"
            >
              {editingId === chat._id ? (
                <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 p-2 rounded">
                  <input
                    className="bg-transparent text-sm w-full outline-none text-slate-900 dark:text-white truncate"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      updateChat.mutate({ id: chat._id, title: editTitle });
                      setEditingId(null);
                    }}
                  >
                    <HiCheck className="text-green-500 ml-2" />
                  </button>
                </div>
              ) : (
                <Link
                  to={`/dashboard/${chat._id}`}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex-1 flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${location.pathname.includes(chat._id) ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
                >
                  <span className="truncate block pr-2">{chat.title}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuId(menuId === chat._id ? null : chat._id);
                    }}
                    className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-opacity shrink-0"
                  >
                    <HiDotsVertical size={16} />
                  </button>
                </Link>
              )}
              {menuId === chat._id && (
                <div className="absolute right-0 top-12 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1 z-[999]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(chat._id);
                      setEditTitle(chat.title);
                      setMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 text-xs p-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    <HiPencil size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete?"))
                        deleteChat.mutate(chat._id);
                    }}
                    className="w-full flex items-center gap-2 text-xs p-2 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    <HiTrash size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 shrink-0">
          <div className="px-2 mb-2">
            <p className="text-slate-900 dark:text-white text-sm font-bold truncate">
              {user?.fullname}
            </p>
            <p className="text-indigo-600 dark:text-indigo-400 text-xs">
              Plan: {user?.plan || "FREE"}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all"
          >
            <HiCog size={20} /> Settings
          </button>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
