import { useState } from "react";
import { HiClipboardCopy, HiCheck } from "react-icons/hi";
import toast from "react-hot-toast";

const CopyButton = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy text");
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy Content"
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
        copied
          ? "bg-[#e27870]/30 text-[#2E2527] border-[#E85A4F]"
          : "bg-[#EAE7DC] hover:bg-[#e27870]/20 text-[#726363] hover:text-[#2E2527] border-[#D8C3A5]"
      } ${className}`}
    >
      {copied ? (
        <>
          <HiCheck className="text-[#E85A4F] text-sm" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <HiClipboardCopy className="text-sm" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

export default CopyButton;
