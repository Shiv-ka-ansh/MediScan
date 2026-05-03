import { Link } from "react-router-dom";
import { Activity, Twitter, Github, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 pt-16 pb-8" style={{ background: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 group mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center shadow-lg">
                <Activity size={18} className="text-white" />
              </div>
              <span className="text-lg font-outfit font-bold text-slate-900">
                MediScan <span className="text-sky-500">AI</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm mb-6 font-inter leading-relaxed">
              Future of Health Intelligence. Decode your medical destiny with AI-powered insights and clinical accuracy.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-sky-500 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-sky-500 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-outfit font-bold mb-4 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-inter">
              <li><Link to="/upload" className="hover:text-sky-500 transition-colors">Upload Report</Link></li>
              <li><Link to="/chat" className="hover:text-sky-500 transition-colors">AI Assistant</Link></li>
              <li><Link to="/reference-values" className="hover:text-sky-500 transition-colors">Lab Values Reference</Link></li>
              <li><Link to="/dashboard" className="hover:text-sky-500 transition-colors">Patient Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-slate-900 font-outfit font-bold mb-4 uppercase tracking-wider text-sm">Legal & Privacy</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-inter">
              <li><a href="#" className="hover:text-sky-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">HIPAA Compliance</a></li>
              <li><a href="#" className="hover:text-sky-500 transition-colors">Data Security</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-900 font-outfit font-bold mb-4 uppercase tracking-wider text-sm">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-inter">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-cyan-400" />
                <a href="mailto:support@mediscan.ai" className="hover:text-slate-900 transition-colors">support@mediscan.ai</a>
              </li>
              <li className="text-slate-500 text-xs mt-4">
                Available 24/7 for clinical emergencies and technical support.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-inter">
            &copy; {new Date().getFullYear()} MediScan AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            System Operational
          </div>
        </div>
      </div>
    </footer>
  );
};
