import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import {
  FileText,
  Brain,
  Shield,
  MessageSquare,
  Upload,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center lg:pt-32">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white/5 rounded-3xl backdrop-blur-3xl border border-white/10 neo-glow ring-1 ring-white/20">
              <Activity className="h-16 w-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-outfit font-extrabold mb-6 tracking-tight leading-[1.1]">
            Future of{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
              Health Intelligence
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-inter">
            Decode your medical destiny with AI. Transform complex reports into
            <span className="text-white font-medium">
              {" "}
              actionable insights
            </span>{" "}
            and crystal-clear explanations.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full shadow-cyan-500/20">
                    Enter Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/upload" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    <Upload className="h-5 w-5 mr-2" /> Upload Report
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full btn-gradient px-12">
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

        {/* Stats Preview */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-12">
          {[
            { label: "Analyses", value: "10k+" },
            { label: "Accuracy", value: "99.9%" },
            { label: "Doctors", value: "500+" },
            { label: "Security", value: "AES-256" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-outfit font-bold text-white">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 font-inter">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
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
            desc="Our proprietary AI models extract every vital metric, spotting patterns that human eyes might miss."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-teal-400" />}
            title="Clinical Integrity"
            desc="Every AI-generated insight is validated by our global network of registered healthcare professionals."
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-emerald-400" />}
            title="Biotech Chat"
            desc="Real-time dialogue with an AI specialist trained specifically on your personal health context."
          />
        </div>
      </div>

      {/* Process Section */}
      <div className="glass-morphism border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md text-left">
              <h2 className="text-4xl font-outfit font-bold mb-6">
                Seamless Workflow
              </h2>
              <ul className="space-y-4">
                {[
                  "Secure PDF/Image/Text Upload",
                  "Automated OCR & Data Extraction",
                  "AI Anomaly Detection engine",
                  "Final Verification by Experts",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center space-x-3 text-slate-300"
                  >
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group w-full max-w-lg">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass-card p-10 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-cyan-400/20 rounded-full flex items-center justify-center mb-6">
                  <Upload size={32} className="text-cyan-400 animate-bounce" />
                </div>
                <h3 className="text-2xl font-outfit font-bold mb-4">
                  Ready to test?
                </h3>
                <p className="text-slate-400 mb-8">
                  Drop your latest report and see the magic happen.
                </p>
                <Link to="/upload" className="w-full">
                  <Button className="w-full" size="lg">
                    Upload Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-8 hover:bg-white/10 transition-all duration-500 group cursor-default">
    <div className="mb-6 p-3 bg-white/5 w-fit rounded-2xl group-hover:bg-cyan-400 group-hover:text-white transition-colors duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-outfit font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed font-inter">{desc}</p>
  </div>
);
