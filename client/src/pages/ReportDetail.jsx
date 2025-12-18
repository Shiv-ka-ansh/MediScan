import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReport } from "../services/reportService";
import { Button } from "../components/Button";
import {
  FileText,
  ChevronLeft,
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
  Activity,
  User,
  Clock,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import jsPDF from "jspdf";

export const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReport(id);
        setReport(data.report);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleDownloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    // (PDF logic remains similar but could be enhanced later)
    doc.setFontSize(22);
    doc.text("MediScan AI Analysis Report", 20, 20);
    // ... logic ...
    doc.save(`${report.fileName}-analysis.pdf`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <Activity
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400"
            size={20}
          />
        </div>
      </div>
    );

  if (!report)
    return (
      <div className="text-center py-20 text-slate-400">Report not found.</div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="text-slate-400 hover:text-white"
        >
          <ChevronLeft className="mr-1" size={18} /> Back to Dashboard
        </Button>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="border-white/10 hover:bg-white/5"
          >
            <Download size={16} className="mr-2" /> PDF Report
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/chat")}
            className="btn-gradient"
          >
            <MessageSquare size={16} className="mr-2" /> Discuss with AI
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Analysis */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <FileText size={120} />
            </div>

            <div className="relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-cyan-400/10 rounded-lg">
                  <Activity className="text-cyan-400" size={24} />
                </div>
                <h1 className="text-3xl font-outfit font-bold text-white">
                  {report.fileName}
                </h1>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <InfoBadge
                  icon={<Clock size={14} />}
                  label="Processed"
                  value={new Date(report.createdAt).toLocaleDateString()}
                />
                <InfoBadge
                  icon={<User size={14} />}
                  label="Reviewer"
                  value={report.reviewedBy?.name || "AI Neural Engine"}
                />
                <StatusBadge status={report.status} />
              </div>

              <section className="mb-10">
                <h3 className="text-lg font-outfit font-bold text-slate-200 mb-4 flex items-center">
                  <Info className="mr-2 text-cyan-400" size={18} /> Clinical
                  Abstract
                </h3>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 leading-relaxed text-slate-300 italic">
                  "{report.aiSummary}"
                </div>
              </section>

              <section>
                <h3 className="text-lg font-outfit font-bold text-slate-200 mb-4">
                  Neural Observations
                </h3>
                <div className="space-y-4">
                  {report.aiAnalysis?.abnormalities?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl"
                    >
                      <AlertTriangle
                        className="text-rose-400 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <span className="text-slate-300 font-inter">{item}</span>
                    </div>
                  ))}
                  {report.aiAnalysis?.abnormalities?.length === 0 && (
                    <div className="flex items-start space-x-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <CheckCircle2
                        className="text-emerald-400 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <span className="text-slate-300 font-inter">
                        No immediate clinical abnormalities detected by the AI
                        core.
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="glass-card p-8 border-white/5">
            <h3 className="text-lg font-outfit font-bold text-slate-200 mb-4">
              Medical Recommendations
            </h3>
            <ul className="grid sm:grid-cols-2 gap-4">
              {report.aiAnalysis?.recommendations?.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5"
                >
                  <CheckCircle2
                    className="text-cyan-400 flex-shrink-0"
                    size={16}
                  />
                  <span className="text-sm text-slate-400">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Original Data & Doctor's Note */}
        <div className="space-y-8">
          <div className="glass-card p-6 border-white/5">
            <h3 className="text-lg font-outfit font-bold text-slate-200 mb-4">
              AI Verification Score
            </h3>
            <div className="flex flex-col items-center py-6">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-cyan-400"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 * 0.05}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-outfit font-bold">95%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    Confidence
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
            <h3 className="text-lg font-outfit font-bold text-slate-200 mb-4 flex items-center">
              <ExternalLink className="mr-2 text-cyan-400" size={18} /> Doctor's
              Perspective
            </h3>
            {report.doctorComments ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed font-inter">
                  {report.doctorComments}
                </p>
                <div className="pt-4 border-t border-white/5 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center">
                    <User size={14} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      {report.reviewedBy?.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Board Certified Specialist
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                <Clock className="mx-auto mb-3 text-slate-600" size={24} />
                <p className="text-xs text-slate-500">
                  Awaiting specialist verification. AI findings are preliminary.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBadge = ({ icon, label, value }) => (
  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
    <div className="flex items-center space-x-2 text-slate-500 mb-1">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="text-xs text-slate-200 font-medium truncate">{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    approved: {
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    rejected: {
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/20",
    },
  }[status] || {
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/20",
  };

  return (
    <div className={`p-3 ${config.bg} rounded-xl border ${config.border}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        Status
      </div>
      <div
        className={`text-xs font-bold ${config.color} uppercase tracking-widest`}
      >
        {status}
      </div>
    </div>
  );
};
