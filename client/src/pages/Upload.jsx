import { useState } from "react";
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
  ShieldAlert,
  Zap,
} from "lucide-react";

export const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");

    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "text/plain",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, Image (JPG/PNG), or Text file.");
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size should be less than 10MB.");
      return;
    }

    setFile(selectedFile);
  };

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex p-3 bg-cyan-400/10 rounded-2xl mb-4">
          <Zap className="text-cyan-400" size={32} />
        </div>
        <h1 className="text-4xl font-outfit font-bold text-white mb-3">
          AI Health Scan
        </h1>
        <p className="text-slate-400 font-inter">
          Deploy our neural engine to decode your medical records.
        </p>
      </div>

      <div className="glass-card p-10 relative overflow-hidden group">
        {/* Decorative background pulse */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400 animate-in zoom-in-95">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!file ? (
          <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 text-center transition-all duration-300 hover:border-cyan-500/50 hover:bg-white/5 cursor-pointer">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
            />
            <div className="space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UploadIcon
                  size={36}
                  className="text-slate-400 group-hover:text-cyan-400"
                />
              </div>
              <div>
                <p className="text-xl font-outfit font-bold text-white mb-1">
                  Select Medical File
                </p>
                <p className="text-slate-500 text-sm">
                  PDF, JPEG, PNG, or TXT up to 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-cyan-400/10 rounded-xl">
                  <File size={28} className="text-cyan-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-white font-bold truncate max-w-[200px] md:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
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
                <ShieldCheck
                  className="text-emerald-400 mt-1 flex-shrink-0"
                  size={18}
                />
                <p className="text-xs text-slate-400">
                  HIPAA compliant data encryption and processing.
                </p>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-cyan-400/5 rounded-xl border border-cyan-400/10">
                <Zap className="text-cyan-400 mt-1 flex-shrink-0" size={18} />
                <p className="text-xs text-slate-400">
                  Instant AI analysis with medical-grade precision.
                </p>
              </div>
            </div>

            <Button
              className="w-full btn-gradient py-4 text-lg"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Analyzing Bio-Metrics...
                </>
              ) : (
                "Start AI Analysis"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-12 p-6 glass-morphism rounded-2xl border-white/5">
        <div className="flex items-center space-x-3 text-slate-300 mb-2">
          <ShieldAlert size={18} className="text-amber-400" />
          <p className="text-sm font-bold font-outfit uppercase tracking-wider">
            Privacy Notice
          </p>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed font-inter">
          Your medical records are processed using state-of-the-art encryption.
          We do not store identifiable personal data beyond the analysis scope.
          AI results are for informational purposes only and should be reviewed
          by a professional.
        </p>
      </div>
    </div>
  );
};
