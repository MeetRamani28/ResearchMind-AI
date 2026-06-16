import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { HiX, HiCheck } from "react-icons/hi";
import api from "../api/axios";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    password: "",
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      const res = await api.patch("/auth/update-profile", formData);
      setUser(res.data.user);
      alert("Profile updated!");
      onClose();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Update failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] w-full max-w-sm p-6 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Profile Settings</h2>
          <button onClick={onClose}>
            <HiX className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
              Full Name
            </p>
            <input
              className="w-full p-3 bg-slate-800 rounded-lg text-white"
              value={formData.fullname}
              onChange={(e) =>
                setFormData({ ...formData, fullname: e.target.value })
              }
            />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
              New Password
            </p>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-slate-800 rounded-lg text-white"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
              Email (Non-editable)
            </p>
            <input
              className="w-full p-3 bg-slate-950 rounded-lg text-slate-500 cursor-not-allowed"
              disabled
              defaultValue={user?.email}
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <HiCheck /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
export default EditProfileModal;
