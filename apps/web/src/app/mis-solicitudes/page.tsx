import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TRADES } from "@/lib/constants";
import { TradeIcon } from "@/components/TradeIcon";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Clock, CheckCircle2, XCircle, ArrowRight, Image as ImageIcon } from "lucide-react";

export default async function ClientRequestsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/mis-solicitudes");
  }

  const requests = await prisma.contactRequest.findMany({
    where: { clientId: user.id },
    include: {
      professional: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mis Solicitudes de Contacto
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Revisá el estado de tus consultas a profesionales de Rosario.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
        >
          <span>Buscar otro profesional</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            Todavía no enviaste ninguna solicitud
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Buscá un plomero, electricista o profesional en tu zona de Rosario y solicitá contacto sin cargo.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Explorar profesionales
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const tradeMeta = TRADES.find((t) => t.id === req.trade);
            let photosList: string[] = [];
            if (req.photos) {
              try {
                photosList = JSON.parse(req.photos);
              } catch {
                photosList = [];
              }
            }

            const formattedDate = new Intl.DateTimeFormat("es-AR", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(req.createdAt));

            return (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <TradeIcon name={req.trade} className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        {req.professional.user.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {tradeMeta ? tradeMeta.name : req.trade} • {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* Estado de la solicitud */}
                  <div>
                    {req.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                        <Clock className="h-3.5 w-3.5" />
                        Esperando respuesta
                      </span>
                    )}

                    {req.status === "accepted" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aceptada
                      </span>
                    )}

                    {req.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                        <XCircle className="h-3.5 w-3.5" />
                        No disponible
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido de la solicitud */}
                <div className="pt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Tu mensaje:
                  </p>
                  <p className="text-sm text-slate-800 bg-slate-50 rounded-xl p-3">
                    {req.description}
                  </p>

                  {/* Fotos adjuntas */}
                  {photosList.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Fotos enviadas ({photosList.length}):</span>
                      </div>
                      <div className="flex gap-2">
                        {photosList.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 hover:opacity-80 transition"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="Foto del arreglo"
                              className="h-full w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones según estado */}
                  {req.status === "accepted" && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/50 rounded-xl p-4">
                      <div>
                        <p className="text-xs font-bold text-emerald-900">
                          ¡El profesional aceptó tu solicitud!
                        </p>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Podés escribirle por WhatsApp para coordinar día, horario y detalles del presupuesto.
                        </p>
                      </div>

                      <WhatsAppButton
                        phone={req.professional.whatsapp}
                        message={`Hola ${req.professional.user.name}, vi que aceptaste mi solicitud de ${tradeMeta ? tradeMeta.name : req.trade} en Oficios Express. Quería consultarte para coordinar.`}
                        className="w-full sm:w-auto"
                      >
                        Chatear por WhatsApp
                      </WhatsAppButton>
                    </div>
                  )}

                  {req.status === "pending" && (
                    <div className="mt-3 text-xs text-slate-400">
                      Te notificaremos apenas el profesional revise tu mensaje. Podés seguir buscando si necesitás una urgencia.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
