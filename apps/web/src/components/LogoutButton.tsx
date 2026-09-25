"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logoutAction())}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 transition"
      title="Cerrar sesión"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  );
}
