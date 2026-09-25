"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { TRADES, ROSARIO_DISTRICTS } from "@/lib/constants";
import { Hammer, User, Briefcase, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "professional" ? "professional" : "client";
  const [role, setRole] = useState<"client" | "professional">(initialRole);
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white mb-3 shadow-xs">
            <Hammer className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Crear cuenta en Oficios Express
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Rosario, Santa Fe
          </p>
        </div>

        {/* Selector de Rol */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
              role === "client"
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Soy Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("professional")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
              role === "professional"
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Soy Profesional</span>
          </button>
        </div>

        {state?.error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="role" value={role} />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ej: Martín Rodríguez"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Teléfono de contacto
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="Ej: 341 555 1234"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {role === "professional" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de WhatsApp para clientes
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  required
                  placeholder="Ej: 5493415551234"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">
                  Formato con código de área (ej: 341... o 549341...).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Oficios que realizás (elegí al menos uno)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRADES.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="trades"
                        value={t.id}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Zonas de Rosario donde trabajás
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROSARIO_DISTRICTS.map((district) => (
                    <label
                      key={district}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="zones"
                        value={district}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{district}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción de tu experiencia y servicios
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  placeholder="Contá qué trabajos hacés, años de experiencia, si das presupuesto sin cargo, etc."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Al menos 6 caracteres"
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
                <span>Creando cuenta...</span>
              </>
            ) : (
              <>
                <span>Registrarme</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Iniciá sesión acá
          </Link>
        </div>
      </div>
    </div>
  );
}
