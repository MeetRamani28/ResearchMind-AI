import { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/`);
        setMessage(response.data);
      } catch (err) {
        console.error("Backend connection error:", err);
        setMessage("Backend is offline!");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen font-bold text-3xl w-full">
      {message}
    </div>
  );
};

export default App;
