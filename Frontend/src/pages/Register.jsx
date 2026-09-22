import { SignUp } from "@clerk/clerk-react";

const Register = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600 mb-2">
            ResearchMind-AI
          </h1>
          <p className="text-slate-400 text-sm">
            Create an account to start multi-agent AI research.
          </p>
        </div>
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default Register;
