import { useState, useCallback, useRef, useEffect } from "react";
import {
  Search, Activity, Sparkles, ChevronDown, ChevronUp,
  Loader2, BookOpen, FlaskConical, Info, X, Zap, Check
} from "lucide-react";

/* ─── API Configuration ────────────────────────────────────────────── */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const fetchReferenceData = async (query) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/reference/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch reference data");
  }
  return await response.json();
};

const checkValueApi = async (testName, value) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/reference/check`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ testName, value }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to check value");
  }
  return await response.json();
};

/* ─── Common test list for dropdown ─────────────────────────────────── */
const COMMON_TESTS = [
  "Hemoglobin", "RBC Count", "WBC Count", "Platelets", "Hematocrit",
  "MCV", "MCH", "MCHC", "Neutrophils", "Lymphocytes", "Eosinophils", "Basophils", "Monocytes",
  "Total Cholesterol", "LDL Cholesterol", "HDL Cholesterol", "Triglycerides", "VLDL",
  "ALT (SGPT)", "AST (SGOT)", "Alkaline Phosphatase", "Total Bilirubin", "Direct Bilirubin",
  "Albumin", "Total Protein", "GGT",
  "Creatinine", "BUN", "Uric Acid", "eGFR", "Sodium", "Potassium", "Chloride", "Bicarbonate",
  "TSH", "Free T3", "Free T4", "Total T3", "Total T4", "Anti-TPO",
  "Fasting Blood Glucose", "Post-Prandial Glucose", "HbA1c", "Insulin (Fasting)", "C-Peptide",
  "Vitamin D (25-OH)", "Vitamin B12", "Folate", "Iron", "Ferritin", "TIBC", "Transferrin Saturation",
  "Calcium", "Phosphorus", "Magnesium", "Zinc",
  "Troponin I", "Troponin T", "CK-MB", "LDH", "BNP", "NT-proBNP",
  "CRP", "ESR", "Procalcitonin", "Fibrinogen",
  "PT", "INR", "aPTT", "D-Dimer",
  "Testosterone", "Estradiol", "FSH", "LH", "Prolactin", "Cortisol", "DHEA-S",
  "PSA", "CA-125", "CEA", "AFP", "HbsAg", "Anti-HCV",
];

/* ─── Quick search list ──────────────────────────────────────────────── */
const QUICK_SEARCHES = [
  "CBC", "Lipid Profile", "LFT", "KFT", "Thyroid Function",
  "Diabetes Panel", "Vitamin D", "Vitamin B12", "Iron Studies",
  "Coagulation Profile", "Cardiac Markers", "Hormone Panel",
];

/* ─── Status config ──────────────────────────────────────────────────── */
const getStatusUI = (status) => {
  const map = {
    normal:          { label: "Normal Range",    bg: "#10b98115", border: "#10b98135", text: "#34d399" },
    low:             { label: "Below Normal",    bg: "#3b82f615", border: "#3b82f635", text: "#60a5fa" },
    high:            { label: "Above Normal",    bg: "#f9731615", border: "#f9731635", text: "#fb923c" },
    borderline_low:  { label: "Borderline Low",  bg: "#eab30815", border: "#eab30835", text: "#fbbf24" },
    borderline_high: { label: "Borderline High", bg: "#eab30815", border: "#eab30835", text: "#fbbf24" },
    critical_low:    { label: "Critically Low",  bg: "#ef444415", border: "#ef444435", text: "#f87171" },
    critical_high:   { label: "Critically High", bg: "#ef444415", border: "#ef444435", text: "#f87171" },
  };
  return map[status] || map.normal;
};

/* ─── Searchable Dropdown ────────────────────────────────────────────── */
const TestDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const filtered = COMMON_TESTS.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (t) => { onChange(t); setOpen(false); setSearch(""); };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
          color: value ? "#e2e8f0" : "#475569",
        }}
      >
        <span className="truncate">{value || "Select a test"}</span>
        <ChevronDown
          size={14}
          style={{
            color: "#475569",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
          style={{
            background: "#0b1526",
            border: "1px solid rgba(99,102,241,0.25)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
          }}
        >
          <div className="p-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Search size={12} style={{ color: "#475569", flexShrink: 0 }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search test..."
                className="flex-1 bg-transparent outline-none"
                style={{ color: "#e2e8f0", fontSize: 12 }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: "#475569" }}>
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 210 }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-5 text-center" style={{ color: "#334155", fontSize: 12 }}>
                No match found
              </div>
            ) : (
              filtered.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => select(t)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-all"
                  style={{
                    fontSize: 12,
                    color: t === value ? "#818cf8" : "#94a3b8",
                    background: t === value ? "rgba(99,102,241,0.08)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (t !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (t !== value) e.currentTarget.style.background = "transparent"; }}
                >
                  {t}
                  {t === value && <Check size={11} style={{ color: "#818cf8" }} />}
                </button>
              ))
            )}
          </div>

          {search && !COMMON_TESTS.map(t => t.toLowerCase()).includes(search.toLowerCase()) && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button
                type="button"
                onClick={() => select(search)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-all"
                style={{ fontSize: 12, color: "#6366f1" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <Search size={11} />
                Use &ldquo;{search}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Result Card ────────────────────────────────────────────────────── */
const ResultCard = ({ result, onClose }) => {
  const ui = getStatusUI(result.status);
  return (
    <div
      className="rounded-2xl p-5 relative mt-4"
      style={{ background: ui.bg, border: `1px solid ${ui.border}` }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 rounded-full p-1 transition-all"
        style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}
      >
        <X size={13} />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: ui.border, color: ui.text }}
        >
          {ui.label}
        </div>
        <span style={{ color: "#94a3b8", fontSize: 11 }}>{result.category}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            Normal Range
          </div>
          <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13, fontFamily: "monospace" }}>
            {result.normal_range}
          </div>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            Unit
          </div>
          <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>
            {result.unit}
          </div>
        </div>
      </div>

      <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>{result.interpretation}</p>

      {result.action && (
        <div
          className="mt-3 rounded-xl px-4 py-2.5 text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${ui.border}`, color: ui.text }}
        >
          Recommended Action: {result.action}
        </div>
      )}

      {result.fun_fact && (
        <div
          className="mt-2 rounded-xl px-4 py-2.5 text-xs"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#94a3b8" }}
        >
          Clinical Note: {result.fun_fact}
        </div>
      )}
    </div>
  );
};

/* ─── Value Checker ──────────────────────────────────────────────────── */
const ValueChecker = () => {
  const [testName, setTestName] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!testName.trim() || !value.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const data = await checkValueApi(testName, value);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(8,16,32,0.95)",
        border: "1px solid rgba(99,102,241,0.28)",
        boxShadow: "0 0 50px rgba(99,102,241,0.06)",
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)" }}
        >
          <Zap size={16} style={{ color: "#6366f1" }} />
        </div>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>Quick Value Checker</div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>
            Select a test, enter your value, and get an AI interpretation
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <div style={{ color: "#64748b", fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Test Name
          </div>
          <TestDropdown value={testName} onChange={setTestName} />
        </div>

        <div>
          <div style={{ color: "#64748b", fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Your Value
          </div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 10.5"
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "#e2e8f0",
            }}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleCheck}
            disabled={loading || !testName || !value}
            className="w-full rounded-xl py-2.5 font-semibold text-sm transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #4338ca, #6d28d9)", color: "white" }}
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
              : <><Sparkles size={14} /> Check Value</>
            }
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mt-3 text-xs rounded-lg px-3 py-2"
          style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171" }}
        >
          {error}
        </div>
      )}
      {result && <ResultCard result={result} onClose={() => setResult(null)} />}
    </div>
  );
};

/* ─── Test Row ───────────────────────────────────────────────────────── */
const TestRow = ({ test, color, idx }) => {
  const [open, setOpen] = useState(false);
  const isInfinity = test.max_is_infinity || test.max === null || test.max === 999;
  const rangeText = `${test.min ?? "—"} – ${isInfinity ? "∞" : test.max ?? "—"}`;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: open ? `${color}06` : "rgba(255,255,255,0.02)",
        border: `1px solid ${open ? color + "28" : "rgba(255,255,255,0.05)"}`,
      }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{test.name}</span>
            {test.gender_specific && test.gender_specific !== "all" && (
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ background: `${color}18`, color, fontSize: 10 }}
              >
                {test.gender_specific === "men" ? "Male" : "Female"}
              </span>
            )}
          </div>
          <div style={{ color: "#64748b", fontSize: 11, marginTop: 1 }}>{test.unit}</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div style={{ color, fontWeight: 700, fontSize: 13, fontFamily: "'Fira Code', monospace" }}>
              {rangeText}
            </div>
            <div style={{ color: "#64748b", fontSize: 10 }}>{test.unit}</div>
          </div>
          <div style={{ color: "#475569" }}>
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 grid gap-2">
          {test.what_it_means && (
            <div
              className="rounded-lg px-3 py-2 text-xs"
              style={{ background: `${color}0c`, color: "#cbd5e1", borderLeft: `2px solid ${color}` }}
            >
              <span style={{ color, fontWeight: 600 }}>What it measures: </span>
              {test.what_it_means}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {test.low_means && (
              <div
                className="rounded-lg px-3 py-2 text-xs"
                style={{ background: "rgba(59,130,246,0.07)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.15)" }}
              >
                <div style={{ color: "#60a5fa", fontWeight: 600, marginBottom: 3 }}>If Low</div>
                {test.low_means}
              </div>
            )}
            {test.high_means && (
              <div
                className="rounded-lg px-3 py-2 text-xs"
                style={{ background: "rgba(239,68,68,0.07)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.15)" }}
              >
                <div style={{ color: "#f87171", fontWeight: 600, marginBottom: 3 }}>If High</div>
                {test.high_means}
              </div>
            )}
          </div>
          {test.note && (
            <div
              className="rounded-lg px-3 py-2 text-xs flex items-start gap-2"
              style={{ background: "rgba(234,179,8,0.07)", color: "#fde68a", border: "1px solid rgba(234,179,8,0.15)" }}
            >
              <Info size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
              {test.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Category Result ────────────────────────────────────────────────── */
const CategoryResult = ({ data }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(8,16,32,0.95)",
        border: `1px solid ${data.color}28`,
        boxShadow: `0 4px 30px ${data.color}08`,
      }}
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        style={{ background: `${data.color}06` }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: `${data.color}15`, border: `1px solid ${data.color}22` }}
          >
            <FlaskConical size={17} style={{ color: data.color }} />
          </div>
          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{data.category}</div>
            {data.description && (
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 1 }}>{data.description}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${data.color}15`, color: data.color }}
          >
            {data.tests?.length ?? 0} parameters
          </span>
          {collapsed
            ? <ChevronDown size={14} style={{ color: "#475569" }} />
            : <ChevronUp size={14} style={{ color: "#475569" }} />
          }
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4">
          {(data.preparation || data.when_to_test) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 mt-1">
              {data.preparation && (
                <div
                  className="rounded-xl px-3 py-2.5 text-xs"
                  style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)", color: "#6ee7b7" }}
                >
                  <span style={{ color: "#34d399", fontWeight: 600 }}>Preparation: </span>
                  {data.preparation}
                </div>
              )}
              {data.when_to_test && (
                <div
                  className="rounded-xl px-3 py-2.5 text-xs"
                  style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", color: "#a5b4fc" }}
                >
                  <span style={{ color: "#818cf8", fontWeight: 600 }}>Who should test: </span>
                  {data.when_to_test}
                </div>
              )}
            </div>
          )}
          <div className="grid gap-2">
            {data.tests?.map((test, i) => (
              <TestRow key={test.name + i} test={test} color={data.color} idx={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────── */
export const ReferenceValues = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = useCallback(async (q) => {
    const term = (q ?? query).trim();
    if (!term) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchReferenceData(term);
      setResults((prev) => {
        const exists = prev.find(
          (r) => r.category?.toLowerCase() === data.category?.toLowerCase()
        );
        if (exists) return prev;
        return [data, ...prev];
      });
      setQuery("");
    } catch (err) {
      setError(err.message || "Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #03070f 0%, #080f1e 50%, #03070f 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        ::-webkit-scrollbar-thumb { 
          background: rgba(99, 102, 241, 0.3); 
          border-radius: 10px; 
          transition: all 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">

        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-2xl"
              style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.2)" }}
            >
              <BookOpen size={20} style={{ color: "#818cf8" }} />
            </div>
            <div>
              <h1 style={{ color: "#f8fafc", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>
                Reference Values
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 1 }}>
                AI-powered medical database — search any test panel
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <ValueChecker />
        </div>

        <div
          className="flex items-center gap-2 rounded-2xl px-4 mb-4"
          style={{ background: "rgba(8,16,32,0.95)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search size={14} style={{ color: "#475569", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search test panel (e.g. CBC, Lipid Profile...)"
            className="flex-1 py-3.5 bg-transparent outline-none text-sm"
            style={{ color: "#e2e8f0" }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-30"
            style={{
              background: "rgba(79,70,229,0.18)",
              color: "#818cf8",
              border: "1px solid rgba(79,70,229,0.28)",
            }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {loading ? "Loading" : "Search"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {QUICK_SEARCHES.map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all disabled:opacity-30"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171" }}
          >
            {error}
          </div>
        )}

        {loading && results.length === 0 && (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <Loader2 size={26} className="animate-spin mx-auto mb-3" style={{ color: "#6366f1" }} />
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Consulting medical database...</div>
          </div>
        )}

        {!loading && results.length === 0 && (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <Activity size={30} className="mx-auto mb-3" style={{ color: "#1e293b" }} />
            <div style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600 }}>No results loaded</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>
              Search for a test panel or use quick access buttons to begin
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {results.map((r, i) => (
            <CategoryResult key={r.category + i} data={r} />
          ))}
        </div>

        {results.length > 0 && (
          <div
            className="mt-8 rounded-2xl px-5 py-4 text-center text-xs leading-relaxed"
            style={{
              background: "rgba(239,68,68,0.04)",
              border: "1px solid rgba(239,68,68,0.12)",
              color: "#94a3b8",
            }}
          >
            <strong style={{ color: "#f87171" }}>Medical Disclaimer:</strong> These AI-powered reference values are for
            educational purposes only. Lab reference ranges vary by facility.
            Always consult a qualified doctor for diagnosis and treatment.
          </div>
        )}
      </div>
    </div>
  );
}

export default ReferenceValues;
