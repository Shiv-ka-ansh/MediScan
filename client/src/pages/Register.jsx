import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/authService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import {
  Activity,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  User,
  Shield,
  Loader2,
  ShieldCheck,
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
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
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

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-12 isolate overflow-hidden">

      {/* Animated orb backgrounds */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in slide-in-from-bottom-6 duration-700">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2" size={18} /> Home
        </Link>

        <div className="glass-card relative overflow-hidden">
          {/* Gradient top strip */}
          <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-teal-400 to-cyan-500 rounded-t-2xl" />

          {/* Decorative internal glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="relative p-10">
            {/* Brand strip */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 ring-1 ring-white/20">
                <Activity className="text-white" size={28} />
              </div>
              <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1 font-outfit">MediScan</p>
              <h1 className="text-3xl font-outfit font-bold text-white">Create Identity</h1>
              <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Initialize Health Neural Link</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 font-outfit ml-1 mb-1.5">
                System Access Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <RoleButton
                  active={formData.role === "patient"}
                  onClick={() => setFormData({ ...formData, role: "patient" })}
                  icon={<User size={18} />}
                  label="Patient"
                />
                <RoleButton
                  active={formData.role === "doctor"}
                  onClick={() => setFormData({ ...formData, role: "doctor" })}
                  icon={<Shield size={18} />}
                  label="Specialist"
                />
              </div>
            </div>

            <GoogleAuthButton mode="signup" role={formData.role} />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-950/60 text-slate-500 backdrop-blur-sm">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <User className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={18} />
                  <Input
                    label="Full Legal Name"
                    className="pl-12 input-glow"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={18} />
                  <Input
                    label="Email Identity"
                    type="email"
                    className="pl-12 input-glow"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <Lock className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={18} />
                  <Input
                    label="Secure Key"
                    type="password"
                    showPasswordToggle
                    className="pl-12 input-glow"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" size={18} />
                  <Input
                    label="Confirm Key"
                    type="password"
                    showPasswordToggle
                    className="pl-12 input-glow"
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 py-4 flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Initialize Identity Link"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-slate-400 text-sm">
                Already registered in the system?{" "}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold underline-offset-4 hover:underline transition-all">
                  Authorize Access
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust line */}
        <div className="mt-6 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={12} className="text-cyan-400" />
            <span>Your data is encrypted end-to-end · Trusted by 500+ healthcare professionals</span>
          </div>
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
      "flex items-center justify-center space-x-3 p-4 rounded-xl border transition-all duration-300",
      active
        ? "bg-cyan-400/10 border-cyan-400/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
        : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/10"
    )}
  >
    {icon}
    <span className="font-outfit font-bold uppercase tracking-wider text-xs">{label}</span>
  </button>
);
