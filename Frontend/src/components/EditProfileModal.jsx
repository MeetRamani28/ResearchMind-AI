import { useState } from "react";
import { HiX, HiCamera } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    currentPassword: "",
    newPassword: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const data = new FormData();
    data.append("fullName", formData.fullName);
    if (formData.currentPassword)
      data.append("currentPassword", formData.currentPassword);
    if (formData.newPassword) data.append("newPassword", formData.newPassword);
    if (avatar) data.append("avatar", avatar);

    try {
      const res = await api.patch("/auth/update-profile", data);

      setUser(res.data.user);
      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error:", error.response?.data);
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl relative transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <HiX size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
          Edit Profile
        </h2>

        <div className="flex justify-center mb-8">
          <label className="relative cursor-pointer group">
            <img
              src={preview}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover shadow-lg"
            />
            <div className="absolute bottom-1 right-1 bg-indigo-600 p-2.5 rounded-full border-4 border-white dark:border-slate-900 group-hover:bg-indigo-700 transition-all">
              <HiCamera className="text-white" size={20} />
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Full Name"
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Current Password"
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default EditProfileModal;
