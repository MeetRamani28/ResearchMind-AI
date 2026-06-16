import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    try {
      const response = await api.post("/auth/login", data);
      setUser(response.data.user);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex items-center justify-center p-8 lg:p-16"
      >
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-slate-500 mt-2">
              Sign in to access your research core
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none transition-all"
              required
            />
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none transition-all"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold transition-all active:scale-95"
            >
              Login
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <hr className="flex-1 border-slate-300 dark:border-slate-700" />
            <span>Or sign in with</span>
            <hr className="flex-1 border-slate-300 dark:border-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
              className="flex items-center justify-center gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <FaGoogle /> Google
            </a>
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/github`}
              className="flex items-center justify-center gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <FaGithub /> GitHub
            </a>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-bold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>

      <div className="hidden lg:flex flex-1 relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-10 max-w-md space-y-6 text-center">
          <div className="w-20 h-20 mx-auto bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
            <IoRocketOutline className="text-4xl text-indigo-400" />
          </div>
          <h2 className="text-5xl font-extrabold leading-tight">
            Research Smarter, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Not Harder.
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            Your AI-powered research assistant is ready to help you analyze,
            draft, and optimize your work.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
