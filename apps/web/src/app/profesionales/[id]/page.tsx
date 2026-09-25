import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TRADES } from "@/lib/constants";
import { TradeIcon } from "@/components/TradeIcon";
import { ContactRequestForm } from "@/components/ContactRequestForm";
import { MapPin, ArrowLeft, ShieldCheck, CheckCircle } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfessionalDetailPage({ params }: ProfilePageProps) {
  const { id } = await params;

  const pro = await prisma.professionalProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!pro) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isSelf = currentUser?.id === pro.userId;

  // Si no está activo y no es el dueño, 404
  if (!pro.isActive && !isSelf) {
    notFound();
  }

  let proTrades: string[] = [];
  let proZones: string[] = [];
  try {
    proTrades = JSON.parse(pro.trades);
  } catch {
    proTrades = [];
  }
  try {
    proZones = JSON.parse(pro.zones);
  } catch {
    proZones = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-3.5 sm:px-6 py-5 sm:py-8">
      {/* Botón Volver */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la búsqueda
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        {/* Columna Izquierda: Información del profesional */}
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-bold text-2xl shadow-xs">
                {pro.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">
                    {pro.user.name}
                  </h1>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      pro.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        pro.isActive ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {pro.isActive ? "Disponible en Rosario" : "Perfil temporalmente pausado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Oficios */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Oficios que realiza
              </h2>
              <div className="flex flex-wrap gap-2">
                {proTrades.map((tradeId) => {
                  const tradeMeta = TRADES.find((t) => t.id === tradeId);
                  return (
                    <span
                      key={tradeId}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                    >
                      <TradeIcon name={tradeId} className="h-4 w-4" />
                      {tradeMeta ? tradeMeta.name : tradeId}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Zonas de Trabajo en Rosario */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Zonas de atención en Rosario
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {proZones.map((zone) => (
                  <span
                    key={zone}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {zone}
                  </span>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Acerca del profesional
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {pro.description}
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Contacto */}
        <div className="md:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-lg text-slate-900 mb-1">
              Solicitar contacto
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enviá una consulta sin cargo. Cuando {pro.user.name} la acepte, continuarán por WhatsApp.
            </p>

            {pro.isActive ? (
              <ContactRequestForm
                professionalId={pro.id}
                professionalName={pro.user.name}
                availableTrades={proTrades}
                isLoggedIn={!!currentUser}
                isSelf={isSelf}
              />
            ) : (
              <div className="rounded-xl bg-amber-50 p-4 text-center text-xs font-medium text-amber-800 border border-amber-200">
                Este profesional tiene su perfil pausado temporalmente y no está recibiendo nuevas solicitudes en este momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
