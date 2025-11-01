import Loading from "@/components/ui/custom-ui/loading";
import { CheckCircle2, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

type ToastStatus = "loading" | "success" | "error";

interface ShowToastOptions {
  id?: string;
  duration?: number;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  rejectDuplication?: boolean;
}

export function useToastLoader(cleanup: boolean = true) {
  const toastIds = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    return () => {
      if (cleanup) toastIds.current.forEach((id) => toast.dismiss(id));
    };
  }, [cleanup]);

  const titles: Record<ToastStatus, string> = useMemo(
    () => ({
      loading: "Chargement...",
      success: "Succès",
      error: "Erreur",
    }),
    []
  );

  const defaults = useMemo(
    () => ({
      loading: { duration: Infinity, position: "top-right" as const },
      success: { duration: 3000, position: "top-right" as const },
      error: { duration: 5000, position: "top-right" as const },
    }),
    []
  );

  const getIcon = (status: ToastStatus) => {
    switch (status) {
      case "loading":
        return <Loading className="m-auto h-5 w-5 animate-spin shrink-0" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
    }
  };

  const showToast = useCallback(
    (status: ToastStatus, message: string, opts?: ShowToastOptions) => {
      const { id, duration, position, rejectDuplication } = {
        ...defaults[status],
        ...opts,
      };

      if (
        typeof rejectDuplication === "boolean" &&
        rejectDuplication &&
        Array.from(toastIds.current).find((toastId) => toastId === id)
      )
        return;

      const toastOpts = {
        description: (
          <div className="flex items-center gap-2">
            {getIcon(status)}
            <span className="text-neutral-700">{message}</span>
          </div>
        ),
        duration,
        position,
        ...(id && { id }),
      };

      const newToastId = toast(titles[status], toastOpts);

      if (newToastId) {
        toastIds.current.add(newToastId);
      }

      return newToastId;
    },
    [defaults, titles]
  );

  return { showToast };
}
