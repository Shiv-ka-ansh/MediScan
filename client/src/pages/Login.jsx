import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/authService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import { Activity, Mail, Lock, LogIn, ArrowLeft, Loader2 } from "lucide-react";

export const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      // Store token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      // Handle different error types
      if (err.response) {
        // Server responded with error status
        setError(
          err.response.data?.message ||
            "Login failed. Please check your credentials."
        );
      } else if (err.request) {
        // Request was made but no response received
        setError(
          "Cannot connect to server. Please check if the server is running."
        );
      } else {
        // Something else happened
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <Link
          to="/"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2" size={18} /> Home
        </Link>

        <div className="glass-card p-10 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />

          <div className="relative">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg mb-4 ring-1 ring-white/20">
                <Activity className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-outfit font-bold text-white">
                Neural Secure
              </h1>
              <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
                Access Health Console
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {/* Google Login Button - Priority */}
            <GoogleAuthButton mode="login" />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/80 text-slate-500">
                  or sign in with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                  size={18}
                />
                <Input
                  label="Email Address"
                  type="email"
                  className="pl-12"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="relative group">
                <Lock
                  className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                  size={18}
                />
                <Input
                  label="Network Key (Password)"
                  type="password"
                  showPasswordToggle
                  className="pl-12"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-gradient py-4 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <>
                    Sign In & Synchronize <LogIn className="ml-2" size={18} />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6 space-y-4">
              <Link
                to="/forgot-password"
                className="block text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                Forgot your password?
              </Link>
              <p className="text-slate-400 text-sm">
                No active neural link?{" "}
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-bold decoration-cyan-400/30 underline-offset-4 hover:underline transition-all"
                >
                  Create Identity
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
