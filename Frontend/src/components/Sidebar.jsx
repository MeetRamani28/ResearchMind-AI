import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useReports } from "../hooks/useReports";
import { useAuth } from "../context/AuthContext";
import {
  HiDotsVertical,
  HiPlus,
  HiTrash,
  HiPencil,
  HiCheck,
  HiLogout,
} from "react-icons/hi";

const Sidebar = () => {
  const { chats, isHistoryLoading, updateChat, deleteChat } = useReports();
  const { setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuId, setMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuId && !e.target.closest(".chat-item-container")) {
        setMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuId]);

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  const startEdit = (chat) => {
    setEditingId(chat._id);
    setEditTitle(chat.title);
    setMenuId(null);
  };

  const saveEdit = (id) => {
    updateChat.mutate({ id, title: editTitle });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("આ ચેટ ડિલીટ કરવી છે?")) {
      deleteChat.mutate(id);
      setMenuId(null);
    }
  };

  return (
    <div className="w-78 h-screen bg-slate-950 border-r border-slate-800 flex flex-col p-4 overflow-hidden">
      <h1 className="text-xl font-bold text-white mb-6 px-2 shrink-0">
        ResearchMind
      </h1>

      <Link
        to="/dashboard"
        className="flex items-center gap-2 w-full bg-indigo-600 text-white p-3 rounded-xl font-bold mb-6 hover:bg-indigo-700 transition-all shrink-0"
      >
        <HiPlus size={20} /> New Chat
      </Link>

      <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
        {isHistoryLoading ? (
          <p className="text-slate-500 text-sm px-3">Loading...</p>
        ) : (
          chats?.map((chat) => (
            <div
              key={chat._id}
              className="chat-item-container group relative flex items-center mb-1"
            >
              {editingId === chat._id ? (
                <div className="flex-1 flex items-center bg-slate-800 p-2 rounded">
                  <input
                    className="bg-transparent text-sm w-full outline-none text-white truncate"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(chat._id)}>
                    <HiCheck className="text-green-400 ml-2" />
                  </button>
                </div>
              ) : (
                <Link
                  to={`/dashboard/${chat._id}`}
                  className={`flex-1 flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                    location.pathname.includes(chat._id)
                      ? "bg-slate-800 text-indigo-400"
                      : "text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  <span className="truncate block pr-2">{chat.title}</span>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuId(menuId === chat._id ? null : chat._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-opacity shrink-0"
                  >
                    <HiDotsVertical size={16} />
                  </button>
                </Link>
              )}

              {menuId === chat._id && (
                <div className="absolute right-0 top-12 w-28 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 z-[999]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(chat);
                    }}
                    className="w-full flex items-center gap-2 text-xs p-2 text-white hover:bg-slate-800 rounded"
                  >
                    <HiPencil size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(chat._id);
                    }}
                    className="w-full flex items-center gap-2 text-xs p-2 text-red-400 hover:bg-slate-800 rounded"
                  >
                    <HiTrash size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-2 text-slate-500 hover:text-white p-2 text-sm transition-colors shrink-0"
      >
        <HiLogout size={18} /> Logout
      </button>
    </div>
  );
};

export default Sidebar;
