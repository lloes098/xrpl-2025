import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "glass border-white/20 text-white",
        secondary: "glass border-white/20 text-white backdrop-blur-md",
        destructive: "bg-gradient-to-r from-red-500 to-pink-600 text-white border-transparent shadow-lg",
        outline: "border border-purple-500/50 text-purple-300 bg-transparent",
        success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent shadow-sm",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-transparent shadow-lg",
        info: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-lg",
        neon: "bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white border-transparent shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={clsx(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
