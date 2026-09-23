import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useReports } from "../hooks/useReports";
import { useAuth } from "../context/AuthContext";
import ResearchMind3DText from "./ResearchMind3DText";
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
  const { chats, createChat, updateChat, deleteChat } = useReports();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuId, setMenuId] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuId && !e.target.closest(".chat-item-container")) setMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuId]);

  const handleCreateNewChat = async (e) => {
    e.preventDefault();
    if (isCreating) return;
    setIsCreating(true);
    try {
      localStorage.removeItem("lastVisitedChat");
      const res = await createChat.mutateAsync();
      const newId = res.data?._id || res.data?.id;
      if (newId) {
        setIsMobileOpen(false);
        navigate(`/dashboard/${newId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Create chat error:", err);
      navigate("/dashboard");
    } finally {
      setIsCreating(false);
    }
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-[100] p-2.5 bg-[#3D3133] text-[#EAE7DC] border border-[#524446] rounded-xl shadow-lg cursor-pointer"
      >
        {isMobileOpen ? <HiX size={22} /> : <HiMenu size={22} />}
      </button>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-[#3D3133]/80 backdrop-blur-sm z-[90]"
        />
      )}

      <aside
        className={`fixed md:relative z-[95] w-72 h-screen bg-[#3D3133] border-r border-[#524446] flex flex-col p-4 transition-transform duration-300 shadow-xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-7 mt-10 md:mt-2 shrink-0">
          <ResearchMind3DText />
          <div className="flex flex-col">
            <h1 className="text-base font-black tracking-tight text-[#EAE7DC] flex items-center gap-1.5">
              ResearchMind
            </h1>
            <span className="text-[10px] font-bold text-[#e27870] tracking-widest uppercase">
              FastAPI • LangGraph
            </span>
          </div>
        </div>

        {/* New Session Action Button (Solid Terracotta Coral - No Gradients) */}
        <button
          onClick={handleCreateNewChat}
          disabled={isCreating}
          className="group relative flex items-center justify-center gap-2 w-full bg-[#E85A4F] hover:bg-[#D1453A] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all duration-200 shrink-0 mb-6 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <HiPlus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
          <span>{isCreating ? "Creating..." : "New Workspace"}</span>
        </button>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
          <div className="px-2 pb-2">
            <span className="text-[11px] font-bold text-[#e27870]/80 uppercase tracking-wider">
              Recent Workspaces
            </span>
          </div>
          {chats?.map((chat) => (
            <div
              key={chat._id}
              className="chat-item-container group relative flex items-center"
            >
              {editingId === chat._id ? (
                <div className="flex-1 flex items-center bg-[#524446] border border-[#e27870]/60 p-2 rounded-xl">
                  <input
                    className="bg-transparent text-sm w-full outline-none text-white truncate font-medium"
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
                    <HiCheck className="text-[#e27870] ml-2 hover:scale-110 transition-transform cursor-pointer" />
                  </button>
                </div>
              ) : (
                <Link
                  to={`/dashboard/${chat._id}`}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex-1 flex items-center justify-between p-2.5 rounded-xl text-sm transition-all min-w-0 cursor-pointer ${
                    location.pathname.includes(chat._id)
                      ? "bg-[#E85A4F]/30 text-[#EAE7DC] font-bold border border-[#e27870]/40 shadow-xs"
                      : "text-[#EAE7DC]/90 hover:text-white hover:bg-[#524446]/50 border border-transparent"
                  }`}
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
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#524446] text-[#e27870] hover:text-white rounded-lg transition-all shrink-0 cursor-pointer"
                  >
                    <HiDotsVertical size={15} />
                  </button>
                </Link>
              )}
              {menuId === chat._id && (
                <div className="absolute right-2 top-10 w-32 bg-[#3D3133] border border-[#524446] rounded-xl shadow-2xl p-1 z-[999]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(chat._id);
                      setEditTitle(chat.title);
                      setMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 text-xs p-2 text-[#EAE7DC] hover:text-white hover:bg-[#524446] rounded-lg transition-colors cursor-pointer"
                  >
                    <HiPencil size={13} /> Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete session?"))
                        deleteChat.mutate(chat._id);
                    }}
                    className="w-full flex items-center gap-2 text-xs p-2 text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <HiTrash size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Profile Footer (Bottom Left Avatar Bar) */}
        <div className="mt-auto border-t border-[#524446] pt-4 shrink-0">
          <div className="flex items-center justify-between px-2">
            <div
              onClick={onOpenSettings}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={user?.avatar || user?.imageUrl || defaultAvatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-xl object-cover border-2 border-[#e27870] shadow-sm group-hover:border-white group-hover:scale-105 transition-all"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#EAE7DC] truncate max-w-[120px] group-hover:text-[#e27870] transition-colors">
                  {user?.fullName || "Researcher"}
                </span>
                <span className="text-[11px] font-semibold text-[#e27870] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E85A4F] animate-pulse" />
                  Engine Ready
                </span>
              </div>
            </div>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 text-[#e27870] hover:text-white hover:bg-[#524446] rounded-xl transition-all cursor-pointer"
                title="User Profile & Settings"
              >
                <HiCog size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
