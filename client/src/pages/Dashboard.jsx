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
  Filter,
  Download,
  UserCircle,
} from "lucide-react";
import { Input } from "../components/Input";

export const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredReports = reports.filter((report) =>
    report.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "rejected":
        return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      default:
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const stats = [
    {
      label: "Total Reports",
      value: reports.length,
      icon: <FileText size={20} className="text-cyan-400" />,
    },
    {
      label: "Pending Review",
      value: reports.filter((r) => r.status === "pending").length,
      icon: <Clock size={20} className="text-amber-400" />,
    },
    {
      label: "Health Insights",
      value: reports.filter((r) => r.aiAnalysis?.abnormalities?.length > 0)
        .length,
      icon: <AlertCircle size={20} className="text-rose-400" />,
    },
    {
      label: "Verified",
      value: reports.filter((r) => r.status === "approved").length,
      icon: <CheckCircle2 size={20} className="text-emerald-400" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-outfit font-bold flex items-center space-x-3">
            <LayoutDashboard className="text-cyan-400" />
            <span>Health Dashboard</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor your medical history and AI insights.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/profile">
            <Button
              variant="outline"
              className="px-8 py-3 border-white/10 hover:bg-white/5"
            >
              <UserCircle size={20} className="mr-2" />
              Edit Profile
            </Button>
          </Link>
          <Link to="/upload">
            <Button className="btn-gradient px-8 py-3">
              <Plus size={20} className="mr-2" />
              New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-6 flex items-center space-x-4 border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="p-3 bg-white/5 rounded-xl">{stat.icon}</div>
            <div>
              <div className="text-2xl font-bold font-outfit text-white">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reports Tools */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <Input
            className="pl-12"
            placeholder="Search reports by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary" className="md:w-auto">
          <Filter size={18} className="mr-2" /> Filter
        </Button>
      </div>

      {/* Reports List */}
      <div className="glass-card overflow-hidden border-white/5">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">
            Scanning health records...
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Report Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Analysis Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-cyan-400/10 rounded-lg group-hover:scale-110 transition-transform">
                          <FileText size={18} className="text-cyan-400" />
                        </div>
                        <span className="font-medium text-slate-200">
                          {report.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border",
                          getStatusColor(report.status)
                        )}
                      >
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/reports/${report._id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:text-cyan-400"
                        >
                          View Details{" "}
                          <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-6 bg-white/5 rounded-full border border-dashed border-white/10">
                <FileText className="h-12 w-12 text-slate-600" />
              </div>
            </div>
            <h3 className="text-xl font-outfit font-bold text-white mb-2">
              No Reports Found
            </h3>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
              You haven't uploaded any medical reports yet. Start your AI
              analysis today.
            </p>
            <Link to="/upload">
              <Button className="btn-gradient">Upload Your First Report</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
