import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useReports } from "../hooks/useReports";
import { useAuth } from "../context/AuthContext";
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

const Sidebar = ({ onOpenSettings }) => {
  const { chats, updateChat, deleteChat } = useReports();
  const { user } = useAuth();
  const location = useLocation();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuId, setMenuId] = useState(null);
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
        <div className="flex items-center gap-3 px-3 mb-8 mt-10 md:mt-2 shrink-0">
          <div className="relative">
            <img
              src="/LOGO.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-600">
              ResearchMind
            </h1>
            <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest">
              AI Assistant
            </span>
          </div>
        </div>

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
                  className={`flex-1 flex items-center justify-between p-3 rounded-lg text-sm transition-colors min-w-0 ${location.pathname.includes(chat._id) ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
                >
                  <span
                    className="truncate flex-1 min-w-0 mr-2"
                    title={chat.title}
                  >
                    {chat.title}
                  </span>
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

        <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4 shrink-0">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {user?.fullName || "User"}
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  Plan: {user?.plan || "FREE"}
                </span>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white"
            >
              <HiCog size={22} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
