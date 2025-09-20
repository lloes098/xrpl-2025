import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-gray-800/30 text-gray-300 border-gray-600/30",
      success: "bg-green-900/20 text-green-300 border-green-600/30",
      warning: "bg-warm-900/20 text-warm-300 border-warm-600/30",
      danger: "bg-red-900/20 text-red-300 border-red-600/30",
      info: "bg-primary-900/20 text-primary-300 border-primary-600/30",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 text-xs font-medium border rounded-full",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
