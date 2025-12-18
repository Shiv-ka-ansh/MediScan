import { forwardRef } from "react";
import { cn } from "../lib/utils";

export const Button = forwardRef(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95 hover:-translate-y-0.5";

    const variants = {
      primary: "btn-gradient shadow-lg shadow-cyan-500/20 text-white",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700",
      outline:
        "border-2 border-white/10 text-white hover:bg-white/5 hover:border-white/20",
      ghost: "text-slate-400 hover:text-white hover:bg-white/5",
      danger:
        "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-8 py-3.5 text-lg font-outfit",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
