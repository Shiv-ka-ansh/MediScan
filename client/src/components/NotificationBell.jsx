import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { io } from "socket.io-client";
import { cn } from "../lib/utils";

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        // Silently handle 404 errors (endpoint may not exist on production)
        if (error.response?.status === 404) {
          // Notifications endpoint not available, skip silently
          return;
        }
        // Only log errors in development
        if (import.meta.env.DEV) {
          console.error("Failed to fetch notifications:", error);
        }
      }
    };

    fetchNotifications();

    // Setup socket connection with error handling
    const token = localStorage.getItem("token");
    let socket = null;

    try {
      socket = io(
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
          "http://localhost:8000",
        {
          auth: { token },
          reconnectionAttempts: 3, // Limit reconnection attempts
          reconnectionDelay: 2000,
          timeout: 5000,
          transports: ["websocket", "polling"],
        }
      );

      socket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      socket.on("connect_error", (error) => {
        // Silently handle connection errors - server may not support sockets
        if (import.meta.env.DEV) {
          console.warn(
            "Socket connection failed, notifications may be delayed"
          );
        }
        // Disconnect to prevent further reconnection attempts
        socket.disconnect();
      });
    } catch (error) {
      // Socket initialization failed, continue without real-time updates
      if (import.meta.env.DEV) {
        console.warn("Socket.io not available");
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      // Silently handle errors
      if (import.meta.env.DEV) {
        console.error("Failed to mark all as read:", error);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-card border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-outfit font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id || notification._id}
                  className={cn(
                    "p-4 border-b border-white/5 hover:bg-white/5 transition-colors",
                    !notification.read && "bg-cyan-400/5"
                  )}
                >
                  <p className="text-sm text-slate-200 font-medium">
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
