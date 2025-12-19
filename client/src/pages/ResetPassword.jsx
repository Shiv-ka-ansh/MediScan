import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Activity, Lock, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import api from "../services/api";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="glass-card p-10 text-center max-w-md">
          <h2 className="text-2xl font-outfit font-bold text-white mb-4">
            Invalid Reset Link
          </h2>
          <p className="text-slate-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password">
            <Button className="btn-gradient">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
          <div className="glass-card p-10 text-center">
            <div className="w-16 h-16 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-emerald-400" size={32} />
            </div>
            <h2 className="text-2xl font-outfit font-bold text-white mb-2">
              Password Reset Successful
            </h2>
            <p className="text-slate-400 mb-6">Redirecting you to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <Link
          to="/login"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2" size={18} /> Back to Login
        </Link>

        <div className="glass-card p-10 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />

          <div className="relative">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg mb-4 ring-1 ring-white/20">
                <Activity className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-outfit font-bold text-white">
                New Password
              </h1>
              <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
                Set New Credentials
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                  size={18}
                />
                <Input
                  label="New Password"
                  type="password"
                  className="pl-12"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Lock
                  className="absolute left-4 top-11 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10"
                  size={18}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  className="pl-12"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  "Reset Password"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
