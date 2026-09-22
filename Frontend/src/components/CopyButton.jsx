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
          ? "bg-[#9DB2BF]/40 text-[#27374D] border-[#526D82]"
          : "bg-[#DDE6ED] hover:bg-[#9DB2BF]/30 text-[#526D82] hover:text-[#27374D] border-[#9DB2BF]"
      } ${className}`}
    >
      {copied ? (
        <>
          <HiCheck className="text-[#526D82] text-sm" />
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
