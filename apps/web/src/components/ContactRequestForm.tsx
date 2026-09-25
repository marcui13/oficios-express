"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createContactRequestAction } from "@/app/actions/requests";
import { TRADES } from "@/lib/constants";
import { Upload, X, Loader2, Send, CheckCircle2 } from "lucide-react";

interface ContactRequestFormProps {
  professionalId: string;
  professionalName: string;
  availableTrades: string[];
  isLoggedIn: boolean;
  isSelf: boolean;
}

export function ContactRequestForm({
  professionalId,
  professionalName,
  availableTrades,
  isLoggedIn,
  isSelf,
}: ContactRequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTrade, setSelectedTrade] = useState(availableTrades[0] || "");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isSelf) {
    return (
      <div className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-600">
        Este es tu propio perfil profesional.
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center">
        <h3 className="font-bold text-base text-slate-900">
          ¿Querés contactar a {professionalName}?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Para solicitar un contacto y coordinar por WhatsApp, ingresá a tu cuenta o registrate en un paso.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/login?redirectTo=/profesionales/${professionalId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </Link>
          <Link
            href={`/registro?role=client&redirectTo=/profesionales/${professionalId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Registrarme como cliente
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-lg text-emerald-900">
          ¡Solicitud enviada con éxito!
        </h3>
        <p className="mt-2 text-sm text-emerald-700">
          {professionalName} recibirá tu pedido. Apenas lo acepte, podrás continuar la conversación directo por WhatsApp.
        </p>
        <div className="mt-5">
          <button
            onClick={() => router.push("/mis-solicitudes")}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Ver mis solicitudes
          </button>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 3) {
      setError("Podés subir como máximo 3 fotos por solicitud.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al subir las imágenes.");
      }

      setPhotos((prev) => [...prev, ...data.urls]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al subir la imagen";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) {
      setError("Elegí el oficio que necesitás.");
      return;
    }
    if (!description.trim()) {
      setError("Por favor contanos qué arreglo necesitás.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("professionalId", professionalId);
      formData.append("trade", selectedTrade);
      formData.append("description", description);
      formData.append("photos", JSON.stringify(photos));

      const res = await createContactRequestAction(null, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Selector de Oficio */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Oficio requerido
        </label>
        <select
          value={selectedTrade}
          onChange={(e) => setSelectedTrade(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
        >
          {availableTrades.map((tradeId) => {
            const tradeMeta = TRADES.find((t) => t.id === tradeId);
            return (
              <option key={tradeId} value={tradeId}>
                {tradeMeta ? tradeMeta.name : tradeId}
              </option>
            );
          })}
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          ¿Qué necesitás arreglar?
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Tengo una fuga en la cañería del baño que no puedo cortar..."
          className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          required
        />
        <span className="text-[11px] text-slate-400">
          Sé lo más claro posible para que el profesional evalúe tu necesidad.
        </span>
      </div>

      {/* Fotos opcionales */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Fotos del problema (opcional, máx. 3)
        </label>

        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((url, idx) => (
              <div
                key={idx}
                className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 rounded-full bg-slate-900/70 p-0.5 text-white hover:bg-slate-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 3 && (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 px-4 text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <Upload className="h-4 w-4 text-slate-500" />
            )}
            <span>{isUploading ? "Subiendo..." : "Adjuntar foto"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Botón de Enviar Solicitud */}
      <button
        type="submit"
        disabled={isPending || isUploading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enviando solicitud...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Enviar solicitud de contacto</span>
          </>
        )}
      </button>
    </form>
  );
}
