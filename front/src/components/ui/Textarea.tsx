import { forwardRef, TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={clsx(
            "flex min-h-[120px] w-full rounded-xl glass border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300",
            error && "border-red-500 focus:ring-red-400 focus:border-red-400",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
