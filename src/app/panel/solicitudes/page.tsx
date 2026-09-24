import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TRADES } from "@/lib/constants";
import { TradeIcon } from "@/components/TradeIcon";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProfessionalRequestActions } from "@/components/ProfessionalRequestActions";
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Image as ImageIcon,
  User,
  AlertCircle,
} from "lucide-react";

export default async function ProfessionalRequestsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/panel/solicitudes");
  }

  if (user.role !== "professional" || !user.professionalProfile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">
          Perfil profesional no configurado
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Para recibir solicitudes de clientes de Rosario, tenés que completar tu perfil profesional.
        </p>
        <div className="mt-6">
          <Link
            href="/panel/perfil"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
          >
            Configurar perfil profesional
          </Link>
        </div>
      </div>
    );
  }

  const profile = user.professionalProfile;

  const requests = await prisma.contactRequest.findMany({
    where: { professionalId: profile.id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const answeredRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Header del Panel */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Solicitudes de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Revisá los pedidos de arreglo y contactá a tus clientes de Rosario por WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              profile.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                profile.isActive ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {profile.isActive ? "Perfil Activo" : "Perfil Pausado"}
          </span>

          <Link
            href="/panel/perfil"
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            Editar perfil
          </Link>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Inbox className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            Aún no recibiste solicitudes
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Asegurate de tener tu perfil activo y con las zonas de Rosario donde podés trasladarte.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Solicitudes Pendientes */}
          {pendingRequests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                  {pendingRequests.length}
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Nuevas solicitudes por responder
                </h2>
              </div>

              <div className="space-y-4">
                {pendingRequests.map((req) => {
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
                      className="rounded-2xl border-2 border-amber-200 bg-amber-50/20 p-5 sm:p-6 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                            <TradeIcon name={req.trade} className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                              <span>{req.client.name}</span>
                              <span className="text-xs font-normal text-slate-500">
                                (Cliente)
                              </span>
                            </h3>
                            <p className="text-xs text-slate-500">
                              {tradeMeta ? tradeMeta.name : req.trade} • {formattedDate}
                            </p>
                          </div>
                        </div>

                        <ProfessionalRequestActions requestId={req.id} />
                      </div>

                      {/* Mensaje y fotos */}
                      <div className="pt-4">
                        <p className="text-xs font-semibold text-slate-700 mb-1">
                          Descripción del arreglo:
                        </p>
                        <p className="text-sm text-slate-800 bg-white rounded-xl p-3 border border-amber-100">
                          {req.description}
                        </p>

                        {photosList.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                              <ImageIcon className="h-3.5 w-3.5" />
                              <span>Fotos enviadas por el cliente ({photosList.length}):</span>
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
                                    alt="Foto de la solicitud"
                                    className="h-full w-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-amber-100/60">
                          <span>
                            Aceptá la solicitud para habilitar el contacto directo por WhatsApp.
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Solicitudes respondidas */}
          {answeredRequests.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-700 mb-3">
                Historial de solicitudes
              </h2>

              <div className="space-y-4">
                {answeredRequests.map((req) => {
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
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <TradeIcon name={req.trade} className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-slate-900">
                              {req.client.name}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {tradeMeta ? tradeMeta.name : req.trade} • {formattedDate}
                            </p>
                          </div>
                        </div>

                        {req.status === "accepted" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aceptada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                            <XCircle className="h-3.5 w-3.5" />
                            Rechazada
                          </span>
                        )}
                      </div>

                      <div className="pt-4">
                        <p className="text-xs font-semibold text-slate-500 mb-1">
                          Necesidad del cliente:
                        </p>
                        <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">
                          {req.description}
                        </p>

                        {/* Si fue aceptada, mostrar teléfono y botón de WhatsApp */}
                        {req.status === "accepted" && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/50 rounded-xl p-4">
                            <div>
                              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                                <Phone className="h-4 w-4 text-emerald-600" />
                                <span>Teléfono cliente: {req.client.phone}</span>
                              </div>
                              <p className="text-xs text-emerald-700 mt-1">
                                Podés escribirle para presentarte y presupuestar.
                              </p>
                            </div>

                            <WhatsAppButton
                              phone={req.client.phone}
                              message={`Hola ${req.client.name}, vi tu solicitud en Oficios Express sobre ${tradeMeta ? tradeMeta.name : req.trade}. ¿Cómo estás? Te escribo para coordinar los detalles.`}
                              className="w-full sm:w-auto"
                            >
                              Contactar por WhatsApp
                            </WhatsAppButton>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
