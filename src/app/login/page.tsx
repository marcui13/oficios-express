"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { Hammer, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white mb-3 shadow-xs">
            <Hammer className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ingresar a tu cuenta
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Oficios Express — Rosario, Santa Fe
          </p>
        </div>

        {state?.error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Ingresando...</span>
              </>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          ¿No tenés una cuenta?{" "}
          <Link
            href={`/registro?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-blue-600 hover:underline"
          >
            Registrate acá
          </Link>
        </div>

        {/* Cuentas demo para facilitar testeo */}
        <div className="mt-6 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-left text-xs text-slate-600">
          <p className="font-semibold text-slate-700 mb-1">Cuentas demo (password: password123):</p>
          <ul className="space-y-1 text-[11px] text-slate-500">
            <li>• <strong>Cliente:</strong> sofia@cliente.com</li>
            <li>• <strong>Plomero/Gasista:</strong> roberto@pro.com</li>
            <li>• <strong>Electricista:</strong> carlos@pro.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
