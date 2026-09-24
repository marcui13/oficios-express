"use client";

import { useTransition } from "react";
import { updateRequestStatusAction } from "@/app/actions/requests";
import { Check, X, Loader2 } from "lucide-react";

interface ProfessionalRequestActionsProps {
  requestId: string;
}

export function ProfessionalRequestActions({ requestId }: ProfessionalRequestActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (status: "accepted" | "rejected") => {
    startTransition(async () => {
      await updateRequestStatusAction(requestId, status);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleUpdate("accepted")}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        <span>Aceptar solicitud</span>
      </button>

      <button
        onClick={() => handleUpdate("rejected")}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-rose-600 disabled:opacity-50 transition"
      >
        <X className="h-3.5 w-3.5" />
        <span>Rechazar</span>
      </button>
    </div>
  );
}
