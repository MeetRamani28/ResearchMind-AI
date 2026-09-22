import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600 mb-2">
            ResearchMind-AI
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to access your autonomous LangGraph research studio.
          </p>
        </div>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default Login;
