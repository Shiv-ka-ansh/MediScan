import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/authService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  Activity,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  User,
  Shield,
  Loader2,
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Neural keys do not match. Please verify passwords.");
      return;
    }

    setLoading(true);

    try {
      const data = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      // Store token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      // Handle different error types
      if (err.response) {
        // Server responded with error status
        setError(err.response.data?.message || "Registration failed. Please try again.");
      } else if (err.request) {
        // Request was made but no response received
        setError("Cannot connect to server. Please check if the server is running.");
      } else {
        // Something else happened
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-700">
        <Link
          to="/"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2" size={18} /> Home
        </Link>

        <div className="glass-card p-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl opacity-50" />

          <div className="relative">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg mb-4 ring-1 ring-white/20">
                <UserPlus className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-outfit font-bold text-white">
                Create Identity
              </h1>
              <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
                Initialize Health Neural Link
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <User
                    className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                    size={18}
                  />
                  <Input
                    label="Full Legal Name"
                    className="pl-12"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                    size={18}
                  />
                  <Input
                    label="Email Identity"
                    type="email"
                    className="pl-12"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 font-outfit ml-1 mb-1.5">
                  System Access Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <RoleButton
                    active={formData.role === "patient"}
                    onClick={() =>
                      setFormData({ ...formData, role: "patient" })
                    }
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                    size={18}
                  />
                  <Input
                    label="Secure Key"
                    type="password"
                    className="pl-12"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                    size={18}
                  />
                  <Input
                    label="Confirm Key"
                    type="password"
                    className="pl-12"
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-gradient py-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Initialize Identity Link"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-slate-400 text-sm">
                Already registered in the system?{" "}
                <Link
                  to="/login"
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline-offset-4 hover:underline transition-all"
                >
                  Authorize Access
                </Link>
              </p>
            </div>
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
    <span className="font-outfit font-bold uppercase tracking-wider text-xs">
      {label}
    </span>
  </button>
);
