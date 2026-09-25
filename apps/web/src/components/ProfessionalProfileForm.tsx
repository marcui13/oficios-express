"use client";

import React, { useState, useTransition, useActionState } from "react";
import {
  updateProfessionalProfileAction,
  toggleProfessionalAvailabilityAction,
} from "@/app/actions/profile";
import { TRADES, ROSARIO_DISTRICTS } from "@/lib/constants";
import { Loader2, Save, Power } from "lucide-react";

interface ProfessionalProfileFormProps {
  initialDescription: string;
  initialWhatsapp: string;
  initialTrades: string[];
  initialZones: string[];
  initialIsActive: boolean;
}

export function ProfessionalProfileForm({
  initialDescription,
  initialWhatsapp,
  initialTrades,
  initialZones,
  initialIsActive,
}: ProfessionalProfileFormProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isToggling, startToggleTransition] = useTransition();
  const [state, formAction, isPending] = useActionState(
    updateProfessionalProfileAction,
    null
  );

  const handleToggle = () => {
    const nextStatus = !isActive;
    setIsActive(nextStatus);
    startToggleTransition(async () => {
      await toggleProfessionalAvailabilityAction(nextStatus);
    });
  };

  return (
    <div className="space-y-6">
      {/* Switch de disponibilidad */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900">
            Disponibilidad en Rosario
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isActive
              ? "Tu perfil es visible en las búsquedas y recibís solicitudes."
              : "Tu perfil está pausado; no aparecerá en las búsquedas públicas."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition ${
            isActive
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          <Power className="h-4 w-4" />
          <span>{isActive ? "Perfil Activo" : "Perfil Pausado"}</span>
        </button>
      </div>

      {/* Formulario de Perfil */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="font-bold text-base text-slate-900 mb-4">
          Datos profesionales
        </h2>

        {state?.error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 border border-emerald-200">
            Perfil actualizado con éxito.
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp de contacto comercial
            </label>
            <input
              type="tel"
              name="whatsapp"
              defaultValue={initialWhatsapp}
              required
              placeholder="Ej: 5493415551234"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500">
              Número al que te escribirán los clientes por WhatsApp cuando aceptes solicitudes.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Oficios que realizás
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
                    defaultChecked={initialTrades.includes(t.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{t.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Zonas de Rosario donde brindás servicio
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
                    defaultChecked={initialZones.includes(district)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{district}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción y experiencia profesional
            </label>
            <textarea
              name="description"
              rows={4}
              defaultValue={initialDescription}
              required
              placeholder="Contá qué experiencia tenés, tipos de trabajos que hacés, garantías que ofrecés..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
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
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
