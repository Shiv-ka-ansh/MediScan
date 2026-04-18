import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadReport } from "../services/reportService";
import { Button } from "../components/Button";
import {
  Upload as UploadIcon,
  File,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
  FileText,
  Image,
  AlignLeft,
  Lock,
  Activity,
  Brain,
  Eye,
} from "lucide-react";

/* ─── File type config ───────────────────────────────────────────────── */
const FILE_META = {
  "application/pdf":  { icon: FileText,  color: "text-rose-400",   bg: "bg-rose-400/10",   label: "PDF Document" },
  "image/jpeg":       { icon: Image,     color: "text-violet-400", bg: "bg-violet-400/10", label: "Medical Image" },
  "image/png":        { icon: Image,     color: "text-violet-400", bg: "bg-violet-400/10", label: "Medical Image" },
  "text/plain":       { icon: AlignLeft, color: "text-amber-400",  bg: "bg-amber-400/10",  label: "Text Report"  },
};

const getFileMeta = (type) =>
  FILE_META[type] ?? { icon: File, color: "text-cyan-400", bg: "bg-cyan-400/10", label: "Medical File" };

/* ─── Analysis messages ──────────────────────────────────────────────── */
const MESSAGES = [
  "Extracting document text...",
  "Running neural analysis...",
  "Detecting biomarkers...",
  "Generating health insights...",
  "Finalizing report...",
];

/* ─── Trust badges (no emojis — lucide icons) ────────────────────────── */
const TRUST_BADGES = [
  { icon: Lock,       title: "AES-256 Encrypted",      sub: "Military-grade encryption" },
  { icon: ShieldCheck,title: "HIPAA Compliant",         sub: "Healthcare data standards" },
  { icon: Brain,      title: "Medical-Grade AI",        sub: "Clinical precision engine" },
  { icon: Eye,        title: "Zero Data Retention",     sub: "Deleted post-analysis" },
];

/* ─── Supported report chips ─────────────────────────────────────────── */
const CHIPS = ["CBC Panel", "Lipid Profile", "Thyroid Function", "HbA1c", "Liver Function"];

export const Upload = () => {
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [msgIndex, setMsgIndex]   = useState(0);
  const navigate = useNavigate();

  /* ── Cycle messages while loading ── */
  useEffect(() => {
    if (!loading) return;
    setMsgIndex(0);
    const id = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1500);
    return () => clearInterval(id);
  }, [loading]);

  /* ── File validation (unchanged logic) ── */
  const processFile = (selectedFile) => {
    setError("");
    if (!selectedFile) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "text/plain"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, Image (JPG/PNG), or Text file.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size should be less than 10MB.");
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  /* ── Drag handlers ── */
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  /* ── Upload (unchanged logic) ── */
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await uploadReport(file);
      navigate(`/reports/${data.report.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload report");
    } finally {
      setLoading(false);
    }
  };

  const fileMeta = file ? getFileMeta(file.type) : null;
  const FileIcon = fileMeta?.icon ?? File;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex p-3 bg-cyan-400/10 rounded-2xl mb-4">
          <Zap className="text-cyan-400" size={32} />
        </div>
        <h1 className="text-4xl font-outfit font-bold text-white mb-3">AI Health Scan</h1>
        <p className="text-slate-400 font-inter">
          Deploy our neural engine to decode your medical records.
        </p>
      </div>

      {/* Main glass card */}
      <div className="glass-card p-10 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        {/* Error banner */}
        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400 animate-in zoom-in-95">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!file ? (
          /* ── Drop zone ── */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragging
                ? "border-cyan-500/70 bg-cyan-500/10 scale-[1.02]"
                : "border-white/10 hover:border-cyan-500/50 hover:bg-white/5"
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
            />
            <div className="space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UploadIcon size={36} className={isDragging ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"} />
              </div>
              <div>
                <p className="text-xl font-outfit font-bold text-white mb-1">
                  {isDragging ? "Drop to Scan" : "Select Medical File"}
                </p>
                <p className="text-slate-500 text-sm">PDF, JPEG, PNG, or TXT up to 10MB</p>
              </div>
            </div>
          </div>
        ) : loading ? (
          /* ── Analysis progress ── */
          <div className="space-y-6 animate-in fade-in duration-500 py-4">
            <div className="text-center">
              <div className="inline-flex p-3 bg-cyan-400/10 rounded-2xl mb-4">
                <Loader2 className="text-cyan-400 animate-spin" size={28} />
              </div>
              <p className="text-white font-outfit font-bold text-lg mb-1">Analyzing Report</p>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="progress-fill h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            </div>

            {/* Cycling status message */}
            <p
              key={msgIndex}
              className="msg-fade text-center text-sm text-slate-400 font-inter h-5"
            >
              {MESSAGES[msgIndex]}
            </p>
          </div>
        ) : (
          /* ── File selected state ── */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${fileMeta.bg}`}>
                  <FileIcon size={28} className={fileMeta.color} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-white font-bold truncate max-w-[200px] md:max-w-md">{file.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {fileMeta.label} · {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-emerald-400/5 rounded-xl border border-emerald-400/10">
                <ShieldCheck className="text-emerald-400 mt-1 flex-shrink-0" size={18} />
                <p className="text-xs text-slate-400">HIPAA compliant data encryption and processing.</p>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-cyan-400/5 rounded-xl border border-cyan-400/10">
                <Zap className="text-cyan-400 mt-1 flex-shrink-0" size={18} />
                <p className="text-xs text-slate-400">Instant AI analysis with medical-grade precision.</p>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 py-4 text-lg font-semibold transition-all"
              onClick={handleUpload}
              disabled={loading}
            >
              Start AI Analysis
            </Button>
          </div>
        )}
      </div>

      {/* Supported Report chips */}
      <div className="mt-8 flex flex-wrap items-center gap-2 justify-center">
        <span className="text-xs text-slate-500 font-inter">AI understands:</span>
        {CHIPS.map((c) => (
          <span key={c} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
            {c}
          </span>
        ))}
      </div>

      {/* Trust badge grid */}
      <div className="mt-10 grid grid-cols-2 gap-4">
        {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="glass-card p-4 flex items-start gap-3">
            <div className="p-2 bg-white/5 rounded-xl flex-shrink-0">
              <Icon size={16} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white font-outfit">{title}</p>
              <p className="text-xs text-slate-400 font-inter mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
