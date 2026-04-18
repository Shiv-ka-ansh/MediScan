import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { useState, useEffect } from "react";
import {
  FileText,
  Brain,
  Shield,
  MessageSquare,
  Upload,
  Activity,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

// 1. Count-Up Component for Stats
const CountUp = ({ end, decimal = false, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(decimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, decimal]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative isolate overflow-hidden bg-slate-950">
      {/* 5. Subtle Neural Network Grid Background */}
      <div className="absolute inset-0 -z-10 opacity-[0.05]" aria-hidden="true">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="cyan"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000 text-center lg:text-left">
            {/* 1. Animated Pulse Ring Icon */}
            <div className="flex justify-center lg:justify-start mb-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-cyan-400/20 animate-ping shadow-[0_0_40px_rgba(34,211,238,0.3)]"></div>
                <div className="absolute -inset-4 rounded-full border border-cyan-400/20 animate-[pulse_3s_ease-in-out_infinite]"></div>
                <div className="absolute -inset-8 rounded-full border border-cyan-400/10 animate-[pulse_4s_ease-in-out_infinite]"></div>
                <div className="relative p-4 bg-slate-900/80 rounded-3xl backdrop-blur-3xl border border-white/10 neo-glow ring-1 ring-cyan-400/30">
                  <Activity className="h-12 w-12 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* 4. Multi-color Gradient Title */}
            <h1 className="text-5xl md:text-7xl font-outfit font-extrabold mb-6 tracking-tight leading-[1.1]">
              Future of{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-500 animate-gradient-x">
                Health Intelligence
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-inter">
              Decode your medical destiny with AI. Transform complex reports
              into
              <span className="text-cyan-400 font-medium">
                {" "}
                actionable insights
              </span>{" "}
              and crystal-clear explanations.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {user ? (
                <>
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full shadow-cyan-500/20 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500"
                    >
                      Enter Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/upload" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-slate-700 hover:bg-slate-800"
                    >
                      <Upload className="h-5 w-5 mr-2" /> Upload Report
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full btn-gradient px-12 bg-gradient-to-r from-cyan-500 to-violet-500"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full text-slate-300 hover:text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 2. Floating Report Card Mockup (Desktop Only) */}
          <div className="hidden lg:block relative animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative glass-card p-6 border-white/20 bg-slate-900/40 backdrop-blur-2xl rounded-3xl overflow-hidden group shadow-2xl">
              {/* Scan Line Animation */}
              <div
                className="scan-line absolute left-0 right-0 h-[2px] pointer-events-none z-20"
                style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)" }}
              />

              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <FileText className="text-violet-400 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Lab Report #842
                    </h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Biochemistry Analysis
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] rounded-full border border-cyan-500/20 font-bold">
                    AI VERIFIED
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <MetricRow
                  label="Hemoglobin"
                  value="14.2 g/dL"
                  status="Optimal"
                  color="text-emerald-400"
                />
                <MetricRow
                  label="Blood Pressure"
                  value="118/76"
                  status="Normal"
                  color="text-emerald-400"
                />
                <MetricRow
                  label="Glucose"
                  value="142 mg/dL"
                  status="High"
                  color="text-red-400"
                  warning
                />
                <MetricRow
                  label="Cholesterol"
                  value="190 mg/dL"
                  status="Borderline"
                  color="text-amber-400"
                />
              </div>

              <div className="mt-8 p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-violet-400 mt-1" />
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "Elevated glucose levels detected. This may correlate with
                    recent dietary intake. Suggested follow-up: HbA1c test."
                  </p>
                </div>
              </div>
            </div>

            {/* Background decorative glow for the card */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] -z-10"></div>
          </div>
        </div>

        {/* 3. Animated Stats Preview */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto border-t border-white/5 pt-12">
          {[
            { label: "Analyses", value: 100, suffix: "+", decimal: false },
            { label: "Accuracy", value: 98.9, suffix: "%", decimal: true },
            { label: "Doctors", value: 10, suffix: "+", decimal: false },
            { label: "Security", value: 256, suffix: "-bit", decimal: false },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-3xl font-outfit font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                <CountUp
                  end={stat.value}
                  suffix={stat.suffix}
                  decimal={stat.decimal}
                />
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-inter">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section - Added violet accents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-outfit font-bold mb-4">
            Precision Medicine Tools
          </h2>
          <p className="text-slate-400">
            Everything you need to manage your health reports in one place.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-cyan-400" />}
            title="Neural Analysis"
            accent="group-hover:bg-cyan-400"
            desc="Our proprietary AI models extract every vital metric, spotting patterns that human eyes might miss."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-violet-400" />}
            title="Clinical Integrity"
            accent="group-hover:bg-violet-500"
            desc="Every AI-generated insight is validated by our global network of registered healthcare professionals."
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-emerald-400" />}
            title="Biotech Chat"
            accent="group-hover:bg-emerald-500"
            desc="Real-time dialogue with an AI specialist trained specifically on your personal health context."
          />
        </div>
      </div>


    </div>
  );
};

const MetricRow = ({ label, value, status, color, warning = false }) => (
  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
    <span className="text-slate-400 text-xs font-medium">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-white text-xs font-bold font-mono">{value}</span>
      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
        warning
          ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
          : color === "text-emerald-400"
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
          : "text-amber-400 bg-amber-500/10 border-amber-500/25"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          warning ? "bg-amber-400" : "bg-emerald-400"
        }`} />
        {status}
      </span>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc, accent }) => (
  <div className="glass-card p-8 hover:bg-white/10 transition-all duration-500 group cursor-default relative overflow-hidden">
    <div
      className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-500`}
    ></div>
    <div
      className={`mb-6 p-3 bg-white/5 w-fit rounded-2xl transition-all duration-500 ${accent} group-hover:text-white`}
    >
      {icon}
    </div>
    <h3 className="text-2xl font-outfit font-bold mb-3 group-hover:translate-x-1 transition-transform">
      {title}
    </h3>
    <p className="text-slate-400 leading-relaxed font-inter">{desc}</p>
  </div>
);
