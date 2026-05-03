import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/authService";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import {
  Activity,
  Mail,
  Lock,
  LogIn,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

export const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        setError(err.response.data?.message || "Login failed. Please check your credentials.");
      } else if (err.request) {
        setError("Cannot connect to server. Please check if the server is running.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 isolate overflow-hidden bg-slate-950">

      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] bg-cyan-600/8 rounded-full blur-[140px]" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[45%] h-[45%] bg-violet-600/8 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <Link
          to="/"
          className="inline-flex items-center text-slate-400 hover:text-cyan-400 mb-5 transition-colors text-sm"
        >
          <ArrowLeft className="mr-1.5" size={15} /> Home
        </Link>

        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Top gradient accent */}
          <div className="h-[3px] bg-gradient-to-r from-cyan-500 via-teal-400 to-violet-500" />

          <div className="p-7 sm:p-8">
            {/* Brand header */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg mb-3 ring-1 ring-white/15">
                <Activity className="text-white" size={22} />
              </div>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] mb-1">MediScan AI</p>
              <h1 className="text-[22px] font-outfit font-bold text-white leading-tight">Welcome Back</h1>
              <p className="text-slate-500 text-xs mt-0.5">Sign in to your health dashboard</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-medium flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              <GoogleAuthButton mode="login" />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[11px] text-slate-500 bg-[#0c1222]">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={16} />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:bg-white/[0.05] focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 hover:border-white/[0.15] outline-none transition-all duration-200"
                  />
                </div>

                {/* Password */}
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={16} />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder:text-slate-500 focus:bg-white/[0.05] focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 hover:border-white/[0.15] outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors z-10"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gradient py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <LogIn size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer link */}
              <p className="text-center text-slate-400 text-xs pt-4 border-t border-white/5">
                Don't have an account?{" "}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust line */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-slate-500/70">
          <ShieldCheck size={11} className="text-cyan-500/50" />
          <span>End-to-end encrypted · Trusted by 500+ healthcare professionals</span>
        </div>
      </div>
    </div>
  );
};
