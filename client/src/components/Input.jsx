import { forwardRef } from "react";
import { cn } from "../lib/utils";

export const Input = forwardRef(
  ({ className, label, error, multiline, rows = 4, ...props }, ref) => {
    const inputStyles = cn(
      "block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-slate-900 transition-all duration-300 backdrop-blur-sm",
      error && "border-rose-500/50 focus:ring-rose-500/30 ring-rose-500/30",
      className
    );

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 font-outfit ml-1">
            {label}
          </label>
        )}
        {multiline ? (
          <textarea ref={ref} rows={rows} className={inputStyles} {...props} />
        ) : (
          <input ref={ref} className={inputStyles} {...props} />
        )}
        {error && <p className="mt-1 text-sm text-rose-400 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
