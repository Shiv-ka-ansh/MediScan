import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getPendingReports,
  reviewReport,
  getReviewedReports,
} from "../services/reportService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  Clock,
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  Activity,
  History,
  Download,
  Eye,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export const DoctorPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [reports, setReports] = useState([]);
  const [reviewedReports, setReviewedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [comments, setComments] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [filterTerm, setFilterTerm] = useState(""); // new filter state

  useEffect(() => {
    loadPendingReports();
    loadReviewedReports();
  }, []);

  const loadPendingReports = async () => {
    try {
      const data = await getPendingReports();
      setReports(data.reports);
    } catch (error) {
      console.error("Failed to load pending reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewedReports = async () => {
    try {
      const data = await getReviewedReports();
      setReviewedReports(data.reports);
    } catch (error) {
      console.error("Failed to load reviewed reports:", error);
    }
  };

  const handleReview = async (status) => {
    if (!selectedReport) return;

    setReviewing(true);
    try {
      await reviewReport(selectedReport._id, status, comments);
      setSelectedReport(null);
      setComments("");
      loadPendingReports();
      loadReviewedReports();
    } catch (error) {
      console.error("Failed to review report:", error);
    } finally {
      setReviewing(false);
    }
  };

  const handleViewFile = (report) => {
    if (report.filePath) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
      const fileName = report.filePath.split("/").pop();
      const fileUrl = `${baseUrl}/uploads/${fileName}`;
      window.open(fileUrl, "_blank");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between gap-6 mb-3">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10">
              <Stethoscope className="text-cyan-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-outfit font-bold text-white">
                Clinical Verification Console
              </h1>
              <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">
                Physician Review Interface
              </p>
            </div>
          </div>
          <Link to="/profile">
            <Button
              variant="outline"
              className="px-6 py-2.5 border-white/10 hover:bg-white/5"
            >
              <UserCircle size={18} className="mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2",
            activeTab === "pending"
              ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Clock size={18} />
          <span>Pending Review ({reports.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2",
            activeTab === "history"
              ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <History size={18} />
          <span>History ({reviewedReports.length})</span>
        </button>
      </div>

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <>
          {reports.length === 0 ? (
            <div className="glass-card p-20 text-center border-white/5">
              <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-outfit font-bold text-white mb-2">
                Queue Empty
              </h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                All pending reports have been successfully verified.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* List Section */}
              {/* Filter Input */}
              <div className="flex items-center mb-4">
                <Input
                  placeholder="Filter reports by filename..."
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="flex-1 mr-2"
                />
                <Button variant="secondary" onClick={() => setFilterTerm("")}>
                  Clear
                </Button>
              </div>

              {/* List Section */}
              <div className="lg:col-span-5 space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                {reports
                  .filter((report) =>
                    report.fileName
                      .toLowerCase()
                      .includes(filterTerm.toLowerCase())
                  )
                  .map((report) => (
                    <div
                      key={report._id}
                      onClick={() => setSelectedReport(report)}
                      className={cn(
                        "glass-card p-6 cursor-pointer transition-all duration-300 border-white/5 relative group",
                        selectedReport?._id === report._id
                          ? "bg-white/10 border-cyan-500/50 shadow-cyan-500/10"
                          : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
                            <FileText size={20} className="text-slate-400" />
                          </div>
                          <h3 className="text-lg font-outfit font-bold text-slate-200">
                            {report.fileName}
                          </h3>
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20 tracking-widest uppercase">
                          <Clock size={10} className="mr-1" /> Pending
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-4 text-xs text-slate-500 font-inter font-medium leading-none">
                        <div className="flex items-center">
                          <User size={14} className="mr-1.5" />{" "}
                          {report.userId?.name || "Anonymous Patient"}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1.5" />{" "}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed italic">
                        "{report.aiSummary}"
                      </p>
                      <div className="mt-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFile(report);
                          }}
                          className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center hover:text-cyan-400"
                        >
                          <Eye size={14} className="mr-1" /> View File
                        </button>
                        <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center">
                          Expand Review{" "}
                          <ChevronRight size={14} className="ml-1" />
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Review Section */}
              <div className="lg:col-span-7">
                {selectedReport ? (
                  <div className="glass-card p-8 sticky top-8 border-white/5 animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                      <h2 className="text-2xl font-outfit font-bold text-white">
                        Detailed Review
                      </h2>
                      <span className="text-xs text-slate-500 font-inter">
                        ID: {selectedReport._id}
                      </span>
                    </div>

                    {/* View Original File Button */}
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFile(selectedReport)}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <Eye size={16} className="mr-2" /> View Uploaded File
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <ReviewSection
                        title="AI Synthesis"
                        icon={<Activity className="text-cyan-400" size={16} />}
                      >
                        <p className="text-sm text-slate-400 leading-relaxed italic">
                          "{selectedReport.aiSummary}"
                        </p>
                      </ReviewSection>

                      <ReviewSection
                        title="Neural Abnormalities"
                        icon={
                          <AlertTriangle className="text-rose-400" size={16} />
                        }
                      >
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedReport.aiAnalysis?.abnormalities?.map(
                            (ab, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-lg"
                              >
                                {ab}
                              </span>
                            )
                          )}
                          {(!selectedReport.aiAnalysis?.abnormalities ||
                            selectedReport.aiAnalysis.abnormalities.length ===
                              0) && (
                            <span className="text-slate-500 text-sm">
                              No abnormalities detected
                            </span>
                          )}
                        </div>
                      </ReviewSection>

                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <h3 className="text-sm font-outfit font-bold text-slate-300 uppercase tracking-widest">
                          Medical Comments
                        </h3>
                        <Input
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Neural signatures verified. Patient status stable..."
                          multiline
                          rows={4}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button
                        variant="danger"
                        className="py-6 rounded-2xl border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white"
                        onClick={() => handleReview("rejected")}
                        disabled={reviewing}
                      >
                        <XCircle size={20} className="mr-2" /> Discard Findings
                      </Button>
                      <Button
                        className="py-6 rounded-2xl btn-gradient"
                        onClick={() => handleReview("approved")}
                        disabled={reviewing}
                      >
                        <CheckCircle size={20} className="mr-2" /> Certify
                        Report
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-12 text-center border-white/5 bg-white/5 flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <ChevronRight
                        className="text-slate-600 rotate-90"
                        size={32}
                      />
                    </div>
                    <p className="text-slate-500 font-outfit font-bold uppercase tracking-widest text-sm">
                      Select a report to initialize review
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="glass-card overflow-hidden border-white/5">
          {reviewedReports.length === 0 ? (
            <div className="p-20 text-center">
              <History className="h-16 w-16 text-slate-600 mx-auto mb-6" />
              <h3 className="text-2xl font-outfit font-bold text-white mb-2">
                No Review History
              </h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                You haven't reviewed any reports yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Report Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Reviewed At
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reviewedReports.map((report) => (
                    <tr
                      key={report._id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-cyan-400/10 rounded-lg">
                            <FileText size={18} className="text-cyan-400" />
                          </div>
                          <span className="font-medium text-slate-200">
                            {report.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {report.userId?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold border",
                            report.status === "approved"
                              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                              : "text-rose-400 bg-rose-400/10 border-rose-400/20"
                          )}
                        >
                          {report.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {report.reviewedAt
                          ? new Date(report.reviewedAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewFile(report)}
                          className="hover:text-cyan-400"
                        >
                          <Eye size={16} className="mr-1" /> View File
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReviewSection = ({ title, icon, children }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-outfit font-bold text-slate-300 uppercase tracking-widest flex items-center">
      <span className="p-1.5 bg-white/5 rounded-md mr-2">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);
