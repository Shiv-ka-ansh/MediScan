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
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
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
                  <span className="text-sm hidden lg:inline">{user?.name}</span>
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

          <div className="flex items-center sm:hidden">
            {/* Mobile menu button could go here */}
          </div>
        </div>
      </div>
    </nav>
  );
};
