import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";
import { NotificationBell } from "./NotificationBell";
import {
  LogOut,
  User,
  FileText,
  MessageSquare,
  Bell,
  Activity,
  UserCircle,
  Menu,
  X,
  Droplets,
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 glass-morphism border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <Activity size={24} className="text-white" />
                </div>
                <span className="text-xl font-outfit font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  MediScan AI
                </span>
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/chat"
                    className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                  >
                    AI Assistant
                  </Link>
                  <Link
                    to="/reference-values"
                    className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                  >
                    Lab Values
                  </Link>
                  {(user.role === "doctor" || user.role === "admin") && (
                    <Link
                      to="/doctor-panel"
                      className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                    >
                      Doctor Panel
                    </Link>
                  )}
                </>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <span className="text-slate-400 text-sm hidden lg:block">
                    Logged in as{" "}
                    <span className="text-white font-medium">{user.name}</span>
                  </span>
                  <Link
                    to="/profile"
                    className="p-2 text-slate-400 hover:text-white transition-colors flex items-center space-x-2 mr-2"
                  >
                    <UserCircle size={18} className="text-cyan-400" />
                    <span className="text-sm hidden lg:inline">
                      {user?.name}
                    </span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="btn-gradient">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 sm:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-300 sm:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Close button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={closeMobileMenu}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Nav Links */}
          <div className="space-y-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 p-3 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all"
                >
                  <Activity size={20} />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/chat"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 p-3 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all"
                >
                  <MessageSquare size={20} />
                  <span className="font-medium">AI Assistant</span>
                </Link>
                <Link
                  to="/reference-values"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 p-3 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all"
                >
                  <Droplets size={20} />
                  <span className="font-medium">Lab Values</span>
                </Link>
                {(user.role === "doctor" || user.role === "admin") && (
                  <Link
                    to="/doctor-panel"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 p-3 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all"
                  >
                    <FileText size={20} />
                    <span className="font-medium">Doctor Panel</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 p-3 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all"
                >
                  <UserCircle size={20} />
                  <span className="font-medium">Profile</span>
                </Link>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <div className="px-3 py-2 mb-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">
                      Signed in as
                    </p>
                    <p className="text-white font-medium truncate">
                      {user.name}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all w-full"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center p-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center p-3 rounded-xl btn-gradient text-white font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
