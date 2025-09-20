"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: "border-green-500/20 bg-green-500/10 text-green-400",
  error: "border-red-500/20 bg-red-500/10 text-red-400",
  warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  info: "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  useEffect(() => {
    toasts.forEach((toast) => {
      const timeout = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timeout);
    });
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-md shadow-lg animate-slide-up min-w-[300px]",
              colorMap[toast.type]
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
