import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserReports } from "../services/reportService";
import { Button } from "../components/Button";
import { cn } from "../lib/utils";
import {
  Plus,
  FileText,
  Calendar,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  LayoutDashboard,
  UserCircle,
  Activity,
  Zap,
  Loader2,
} from "lucide-react";
import { Input } from "../components/Input";

/* ─── Helpers ────────────────────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const formatDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ─── Neural grid ────────────────────────────────────────────────────── */
const NeuralGrid = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.04]"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="dash-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dash-grid)" />
  </svg>
);

/* ─── Animated count-up number ───────────────────────────────────────── */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let frame = 0;
    const total = Math.ceil(1200 / 16);
    const timer = setInterval(() => {
      frame++;
      setDisplay(Math.round((frame / total) * value));
      if (frame >= total) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
};

/* ─── Stat card ──────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, borderColor, glowColor, delay }) => (
  <div
    className="stat-pop glass-card p-6 flex items-center space-x-4 border-white/5
                hover:border-white/15 transition-all duration-300 group cursor-default
                overflow-hidden relative"
    style={{ animationDelay: `${delay}ms`, borderLeftWidth: "3px", borderLeftColor: borderColor }}
  >
    <div
      className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0
                  group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: glowColor }}
    />
    <div
      className="relative z-10 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
      style={{ background: glowColor }}
    >
      {icon}
    </div>
    <div className="relative z-10">
      <div className="text-2xl font-bold font-outfit text-white">
        <AnimatedNumber value={value} />
      </div>
      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
        {label}
      </div>
    </div>
  </div>
);

/* ─── Status helpers ─────────────────────────────────────────────────── */
const STATUS = {
  approved: {
    pill: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    dot: "bg-emerald-400",
    rowBorder: "#34d399",
    pulse: false,
  },
  rejected: {
    pill: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    dot: "bg-rose-400",
    rowBorder: "#fb7185",
    pulse: false,
  },
  pending: {
    pill: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    dot: "bg-amber-400",
    rowBorder: "#fbbf24",
    pulse: true,
  },
};

const getStatus = (s) => STATUS[s] ?? STATUS.pending;

/* ─── Shimmer skeleton row ───────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="border-b border-white/5">
    <td className="px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="shimmer w-10 h-10 rounded-xl bg-white/5" />
        <div className="space-y-2">
          <div className="shimmer h-3 w-36 rounded-md bg-white/5" />
          <div className="shimmer h-2 w-24 rounded-md bg-white/5" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="shimmer h-5 w-20 rounded-full bg-white/5" />
    </td>
    <td className="px-6 py-4">
      <div className="shimmer h-3 w-24 rounded-md bg-white/5" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="shimmer h-7 w-24 rounded-lg bg-white/5 ml-auto" />
    </td>
  </tr>
);

/* ─── Mobile report card ─────────────────────────────────────────────── */
const MobileReportCard = ({ report }) => {
  const s = getStatus(report.status);
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-cyan-400/10 rounded-lg flex-shrink-0">
            <FileText size={16} className="text-cyan-400" />
          </div>
          <span className="font-medium text-slate-200 text-sm truncate">{report.fileName}</span>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase flex-shrink-0", s.pill)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot, s.pulse && "animate-pulse")} />
          {report.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Calendar size={12} />
          {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
        <Link to={`/reports/${report._id}`}>
          <Button variant="ghost" size="sm" className="hover:text-cyan-400 text-xs h-7 px-3">
            View <ChevronRight size={13} className="ml-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

/* ─── Empty state ────────────────────────────────────────────────────── */
const EmptyState = () => {
  const chips = ["Blood Test", "X-Ray Report", "Thyroid Panel"];
  return (
    <div className="p-16 text-center flex flex-col items-center">
      {/* Animated dashed border + floating icon */}
      <div className="relative mb-8">
        <svg width="120" height="120" className="absolute inset-0 -m-2" viewBox="0 0 124 124" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="120" height="120" rx="28"
            stroke="rgba(34,211,238,0.4)" strokeWidth="2"
            strokeDasharray="8 6"
            style={{ animation: "spin-slow 12s linear infinite", transformOrigin: "62px 62px" }}
          />
        </svg>
        <div className="w-28 h-28 bg-white/5 rounded-3xl border border-dashed border-white/10 flex items-center justify-center animate-float">
          <FileText className="h-12 w-12 text-slate-500" />
        </div>
      </div>

      <h3 className="text-xl font-outfit font-bold text-white mb-2">No Reports Found</h3>
      <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed text-sm">
        You have not uploaded any medical reports yet. Start your AI analysis today.
      </p>
      <Link to="/upload">
        <Button className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-8 mb-8">
          <Plus size={16} className="mr-2" /> Upload First Report
        </Button>
      </Link>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-slate-500 mr-1 self-center">AI understands:</span>
        {chips.map((c) => (
          <span key={c} className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
            <Plus size={10} className="text-cyan-400" /> {c}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Dashboard ─────────────────────────────────────────────────── */
export const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getUserReports();
        setReports(data.reports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchSearch = r.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "all" || r.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const stats = [
    {
      label: "Total Reports",
      value: reports.length,
      icon: <FileText size={20} className="text-cyan-400" />,
      borderColor: "#22d3ee",
      glowColor: "rgba(34,211,238,0.12)",
      delay: 0,
    },
    {
      label: "Pending Review",
      value: reports.filter((r) => r.status === "pending").length,
      icon: <Clock size={20} className="text-amber-400" />,
      borderColor: "#fbbf24",
      glowColor: "rgba(251,191,36,0.12)",
      delay: 80,
    },
    {
      label: "Health Insights",
      value: reports.filter((r) => r.aiAnalysis?.abnormalities?.length > 0).length,
      icon: <AlertCircle size={20} className="text-rose-400" />,
      borderColor: "#fb7185",
      glowColor: "rgba(251,113,133,0.12)",
      delay: 160,
    },
    {
      label: "Verified",
      value: reports.filter((r) => r.status === "approved").length,
      icon: <CheckCircle2 size={20} className="text-emerald-400" />,
      borderColor: "#34d399",
      glowColor: "rgba(52,211,153,0.12)",
      delay: 240,
    },
  ];

  const filters = ["all", "pending", "approved", "rejected"];

  return (
    <div className="relative min-h-screen">
      <NeuralGrid />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-cyan-400/20 animate-ping opacity-60" />
              <div className="relative p-2 bg-white/5 rounded-xl border border-white/10">
                <LayoutDashboard className="text-cyan-400" size={22} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-outfit font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-500 animate-gradient-x">
                Health Dashboard
              </h1>
              <p className="text-slate-500 text-xs font-inter mt-0.5">
                Monitor your medical history and AI insights
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link to="/profile">
              <Button variant="outline" className="px-5 py-2.5 border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-sm">
                <UserCircle size={16} className="mr-2" /> Edit Profile
              </Button>
            </Link>
            <Link to="/upload">
              <Button className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-5 py-2.5 text-sm shadow-lg shadow-cyan-900/20 transition-all">
                <Plus size={16} className="mr-2" /> New Report
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Welcome Banner ── */}
        <div className="glass-card p-5 mb-10 relative overflow-hidden"
             style={{ borderImage: "linear-gradient(90deg,#22d3ee,#8b5cf6) 1" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xl font-outfit font-bold text-white">
                {getGreeting()}{user?.name ? `, ${user.name}` : ""}
              </p>
              <p className="text-xs text-slate-500 font-inter mt-0.5">{formatDate()}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full self-start sm:self-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-emerald-400 text-xs font-bold">Neural Engine Online</span>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ── Search + Filter ── */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white
                         placeholder-slate-500 transition-all duration-200 input-glow focus:border-cyan-500/50"
              placeholder="Search reports by filename..."
              value={searchTerm}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 pl-1">
                <span
                  className="w-3 h-3 border-2 border-slate-500 border-t-cyan-400 rounded-full spin-slow inline-block"
                />
                Searching...
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all duration-200",
                  activeFilter === f
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Accent bar + Table ── */}
        <div className="glass-card overflow-hidden border-white/5">
          <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-violet-500 to-teal-500" />

          {loading ? (
            <>
              {/* Desktop skeleton */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      {["Report Name", "Analysis Status", "Date", "Actions"].map((h, i) => (
                        <th key={i} className={cn("px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest", i === 3 && "text-right")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                  </tbody>
                </table>
              </div>
              {/* Mobile skeleton */}
              <div className="md:hidden p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass-card p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="shimmer w-10 h-10 rounded-xl bg-white/5" />
                      <div className="space-y-2 flex-1">
                        <div className="shimmer h-3 w-3/4 rounded-md bg-white/5" />
                        <div className="shimmer h-2 w-1/2 rounded-md bg-white/5" />
                      </div>
                      <div className="shimmer h-5 w-16 rounded-full bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : filteredReports.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Report Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Analysis Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredReports.map((report) => {
                      const s = getStatus(report.status);
                      return (
                        <tr
                          key={report._id}
                          className="hover:bg-white/[0.03] transition-colors group"
                          style={{ borderLeft: `2px solid transparent` }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = s.rowBorder)}
                          onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = "transparent")}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-cyan-400/10 rounded-lg group-hover:scale-[1.15] group-hover:bg-cyan-400/20 transition-all duration-200">
                                <FileText size={16} className="text-cyan-400" />
                              </div>
                              <span className="font-medium text-slate-200 text-sm truncate max-w-[200px]">
                                {report.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide", s.pill)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", s.dot, s.pulse && "animate-pulse")} />
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar size={13} className="text-slate-600" />
                              {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/reports/${report._id}`}>
                              <Button variant="ghost" size="sm" className="hover:text-cyan-400 hover:bg-cyan-400/5 text-xs transition-colors">
                                View Details <ChevronRight size={14} className="ml-1" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card grid */}
              <div className="md:hidden p-4 grid gap-3">
                {filteredReports.map((r) => <MobileReportCard key={r._id} report={r} />)}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Footer count */}
        {!loading && filteredReports.length > 0 && (
          <p className="text-center text-xs text-slate-600 mt-5 font-inter">
            Showing {filteredReports.length} of {reports.length} report{reports.length !== 1 ? "s" : ""}
            {activeFilter !== "all" && ` — filtered by "${activeFilter}"`}
          </p>
        )}
      </div>
    </div>
  );
};
