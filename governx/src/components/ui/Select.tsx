import { forwardRef, SelectHTMLAttributes } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <select
            className={clsx(
              "flex h-12 w-full rounded-xl glass border border-white/20 bg-transparent px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all duration-300 cursor-pointer",
              error && "border-red-500 focus:ring-red-400 focus:border-red-400",
              className
            )}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
