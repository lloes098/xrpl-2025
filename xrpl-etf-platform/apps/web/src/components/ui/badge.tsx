import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      success: "bg-green-500/10 text-green-400 border-green-500/20",
      warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      danger: "bg-red-500/10 text-red-400 border-red-500/20",
      info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
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
