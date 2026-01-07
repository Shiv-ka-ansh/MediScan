import { forwardRef, useState } from "react";
import { cn } from "../lib/utils";
import { Eye, EyeOff } from "lucide-react";

export const Input = forwardRef(
  (
    {
      className,
      label,
      error,
      multiline,
      rows = 4,
      type,
      showPasswordToggle,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine actual input type for password toggle
    const inputType = type === "password" && showPassword ? "text" : type;

    const inputStyles = cn(
      "block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-slate-900 transition-all duration-300 backdrop-blur-sm",
      error && "border-rose-500/50 focus:ring-rose-500/30 ring-rose-500/30",
      type === "password" && showPasswordToggle && "pr-12", // Extra padding for toggle button
      className
    );

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 font-outfit ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {multiline ? (
            <textarea
              ref={ref}
              rows={rows}
              className={inputStyles}
              {...props}
            />
          ) : (
            <input
              ref={ref}
              type={inputType}
              className={inputStyles}
              {...props}
            />
          )}
          {/* Password visibility toggle button */}
          {type === "password" && showPasswordToggle && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors z-10"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-rose-400 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
