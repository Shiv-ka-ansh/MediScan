import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/authService";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import {
  Activity,
  Mail,
  Lock,
  User,
  Shield,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "../lib/utils";

export const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await register(formData.name, formData.email, formData.password, formData.role);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
        setError(err.response.data?.message || "Registration failed. Please try again.");
      } else if (err.request) {
        setError("Cannot connect to server. Please check if the server is running.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10 hover:border-slate-300 outline-none transition-all duration-200";

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-8 isolate overflow-hidden" style={{ background: '#F1F5F9' }}>

      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] -right-[10%] w-[45%] h-[45%] bg-indigo-400/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-[15%] -left-[10%] w-[45%] h-[45%] bg-sky-400/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <Link
          to="/"
          className="inline-flex items-center text-slate-400 hover:text-cyan-400 mb-5 transition-colors text-sm"
        >
          <ArrowLeft className="mr-1.5" size={15} /> Home
        </Link>

        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Top gradient accent */}
          <div className="h-[3px] bg-gradient-to-r from-violet-500 via-teal-400 to-cyan-500" />

          <div className="p-7 sm:p-8">
            {/* Brand header */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg mb-3 ring-1 ring-white/15">
                <Activity className="text-white" size={22} />
              </div>
              <p className="text-[10px] text-sky-500 font-bold uppercase tracking-[0.2em] mb-1">MediScan AI</p>
              <h1 className="text-[22px] font-outfit font-bold text-slate-900 leading-tight">Create Account</h1>
              <p className="text-slate-400 text-xs mt-0.5">Join the smart health platform</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-medium flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 shrink-0" />
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-600 ml-0.5 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <RoleButton
                  active={formData.role === "patient"}
                  onClick={() => setFormData({ ...formData, role: "patient" })}
                  icon={<User size={16} />}
                  label="Patient"
                />
                <RoleButton
                  active={formData.role === "doctor"}
                  onClick={() => setFormData({ ...formData, role: "doctor" })}
                  icon={<Shield size={16} />}
                  label="Doctor"
                />
              </div>
            </div>

            <GoogleAuthButton mode="signup" role={formData.role} />

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[11px] text-slate-400 bg-slate-100">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors z-10" size={16} />
                  <input type="text" placeholder="Full name" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors z-10" size={16} />
                  <input type="email" placeholder="Email address" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={16} />
                  <input type={showPw ? "text" : "password"} placeholder="Password" required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputCls.replace("pr-4", "pr-11")}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors z-10">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={16} />
                  <input type={showCpw ? "text" : "password"} placeholder="Confirm password" required value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={inputCls.replace("pr-4", "pr-11")}
                  />
                  <button type="button" onClick={() => setShowCpw(!showCpw)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors z-10">
                    {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer link */}
            <p className="text-center text-slate-500 text-xs pt-4 mt-5 border-t border-slate-100">
              Already have an account?{" "}
              <Link to="/login" className="text-sky-500 hover:text-sky-600 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
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

const RoleButton = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer",
      active
        ? "bg-sky-50 border-sky-400 text-sky-600 shadow-sm"
        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
    )}
  >
    {icon}
    <span className="font-medium text-xs">{label}</span>
  </button>
);
