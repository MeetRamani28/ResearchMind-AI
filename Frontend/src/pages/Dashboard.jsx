import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-700">
      <div className="text-center p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-lg">
        <h1 className="text-4xl font-extrabold mb-4">
          Welcome back,{" "}
          <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {user?.fullName || "User"}!
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The ResearchMind AI core is ready. How can we assist with your
          research today?
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
