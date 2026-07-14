import { AiOutlineLoading3Quarters } from "react-icons/ai";

const LoadingScreen = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm w-full">
        <AiOutlineLoading3Quarters className="w-12 h-12 text-blue-500 animate-spin mb-6" />

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Loading Services
        </h2>

        <p className="text-gray-500 mb-4">Discovering amazing services...</p>

        <div className="flex gap-1 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"></div>
        </div>

        <p className="text-[10px] text-gray-400">
          Check console for detailed info
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
