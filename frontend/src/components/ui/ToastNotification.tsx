import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: {
    border: "border-[rgba(0,255,136,0.3)]",
    icon: "text-neon-green",
    bg: "bg-[rgba(0,255,136,0.05)]",
  },
  error: {
    border: "border-[rgba(244,63,94,0.3)]",
    icon: "text-neon-rose",
    bg: "bg-[rgba(244,63,94,0.05)]",
  },
  warning: {
    border: "border-[rgba(245,158,11,0.3)]",
    icon: "text-neon-amber",
    bg: "bg-[rgba(245,158,11,0.05)]",
  },
  info: {
    border: "border-[rgba(0,212,255,0.3)]",
    icon: "text-neon-cyan",
    bg: "bg-[rgba(0,212,255,0.05)]",
  },
};

let addToastGlobal: ((toast: Omit<ToastData, "id">) => void) | null = null;

export function showToast(type: ToastType, title: string, message?: string) {
  addToastGlobal?.({ type, title, message });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => {
      addToastGlobal = null;
    };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          const color = colors[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`glass ${color.bg} ${color.border} p-4 rounded-2xl min-w-[320px] max-w-[400px] flex items-start gap-3`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color.icon}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{toast.title}</p>
                {toast.message && (
                  <p className="text-[rgba(255,255,255,0.5)] text-xs mt-0.5">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
