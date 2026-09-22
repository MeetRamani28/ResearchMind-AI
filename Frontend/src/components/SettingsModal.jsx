import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { HiX, HiAdjustments, HiUser, HiSave } from "react-icons/hi";

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setAvatarUrl(user.avatar || "");
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await api.patch("/auth/profile", {
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      if (res.data?.user) {
        setUser((prev) => ({
          ...prev,
          fullName: res.data.user.fullName,
          avatar: res.data.user.avatar,
        }));
        toast.success("Profile metadata updated!");
        onClose();
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#27374D]/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-[#9DB2BF] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#9DB2BF] bg-[#DDE6ED]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#9DB2BF]/30 border border-[#526D82]/40 text-[#526D82] flex items-center justify-center font-bold">
              <HiAdjustments size={18} />
            </div>
            <h2 className="text-lg font-bold text-[#27374D]">User Settings & Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#526D82] hover:text-[#27374D] hover:bg-[#9DB2BF]/30 rounded-lg transition-colors cursor-pointer"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
          {/* Editable Account Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#526D82] flex items-center gap-1.5">
              <HiUser className="text-[#526D82]" /> Edit Profile Metadata
            </h3>

            {/* Profile Avatar Preview & URL Input */}
            <div className="p-4 rounded-xl bg-[#DDE6ED] border border-[#9DB2BF] flex items-center gap-4">
              <img
                src={avatarUrl || user?.avatar || defaultAvatar}
                alt="Avatar Preview"
                className="w-14 h-14 rounded-xl object-cover border-2 border-[#526D82] shadow-md shrink-0"
              />
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-[#27374D] block">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full p-2 bg-white border border-[#9DB2BF] rounded-lg text-xs outline-none focus:border-[#526D82] focus:ring-1 focus:ring-[#526D82] text-[#27374D]"
                />
              </div>
            </div>

            {/* Full Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#27374D] block">
                Full Name / Username
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full p-2.5 bg-white border border-[#9DB2BF] rounded-xl text-sm outline-none focus:border-[#526D82] focus:ring-1 focus:ring-[#526D82] text-[#27374D] font-medium"
              />
            </div>
          </div>

          {/* Engine Architecture Metadata */}
          <div className="space-y-3 pt-2 border-t border-[#9DB2BF]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#526D82]">
              Engine Metadata
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-[#DDE6ED] border border-[#9DB2BF] text-[#27374D]">
                <span>AI Core Engine</span>
                <span className="font-semibold text-[#526D82]">LangGraph (StateGraph)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#DDE6ED] border border-[#9DB2BF] text-[#27374D]">
                <span>LLM Provider</span>
                <span className="font-semibold text-[#526D82]">Cohere Command-R+</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#DDE6ED] border border-[#9DB2BF] text-[#27374D]">
                <span>Vector Embeddings</span>
                <span className="font-semibold text-[#526D82]">Cohere embed-english-v3.0</span>
              </div>
            </div>
          </div>

          {/* Save Action Footer (Solid Color - No Gradients) */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#9DB2BF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#526D82] hover:text-[#27374D] hover:bg-[#DDE6ED] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#526D82] hover:bg-[#3E5466] rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <HiSave size={15} />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
