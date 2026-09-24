import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TRADES, ROSARIO_DISTRICTS } from "@/lib/constants";
import { TradeIcon } from "@/components/TradeIcon";
import { MapPin, Search, ArrowRight, ShieldCheck, Clock, MessageCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    trade?: string;
    zone?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { trade, zone } = await searchParams;

  // Consultar profesionales activos
  let allPros: Array<{
    id: string;
    description: string;
    trades: string;
    zones: string;
    user: { name: string; email: string };
  }> = [];

  try {
    allPros = await prisma.professionalProfile.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (err) {
    console.error("Error al consultar profesionales desde la base de datos:", err);
  }

  // Filtrado en memoria para SQLite JSON
  const filteredPros = allPros.filter((pro) => {
    let matchTrade = true;
    let matchZone = true;

    if (trade) {
      try {
        const tradesList: string[] = JSON.parse(pro.trades);
        matchTrade = tradesList.includes(trade);
      } catch {
        matchTrade = false;
      }
    }

    if (zone) {
      try {
        const zonesList: string[] = JSON.parse(pro.zones);
        matchZone = zonesList.includes(zone) || zonesList.includes("Todos");
      } catch {
        matchZone = false;
      }
    }

    return matchTrade && matchZone;
  });

  const activeTradeObj = TRADES.find((t) => t.id === trade);

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-slate-50 border-b border-slate-200 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-4">
              <MapPin className="h-3.5 w-3.5" />
              Exclusivo Rosario, Santa Fe
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Solucioná los arreglos de tu casa con profesionales de oficio.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Elegí el oficio que necesitás, consultá los profesionales disponibles en tu zona de Rosario y contactalos directamente por WhatsApp.
            </p>
          </div>

          {/* Filtros rápidos: Oficio y Zona */}
          <div className="mt-8 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <form method="GET" action="/" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Oficio
                </label>
                <div className="relative">
                  <select
                    name="trade"
                    defaultValue={trade || ""}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Todos los oficios</option>
                    {TRADES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Zona en Rosario
                </label>
                <div className="relative">
                  <select
                    name="zone"
                    defaultValue={zone || ""}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Todas las zonas</option>
                    {ROSARIO_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <Search className="h-4 w-4" />
                  Filtrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Catálogo de Oficios en Botones Rápidos */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Oficios disponibles
          </h2>
          {trade && (
            <Link
              href="/"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Ver todos
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {TRADES.map((t) => {
            const isSelected = trade === t.id;
            return (
              <Link
                key={t.id}
                href={isSelected ? "/" : `/?trade=${t.id}${zone ? `&zone=${encodeURIComponent(zone)}` : ""}`}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg mb-2 ${
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <TradeIcon name={t.id} className="h-6 w-6" />
                </div>
                <span className="font-semibold text-sm">{t.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Listado de Profesionales */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {activeTradeObj
                ? `Profesionales de ${activeTradeObj.name}`
                : "Profesionales disponibles en Rosario"}
            </h2>
            <p className="text-sm text-slate-500">
              {filteredPros.length}{" "}
              {filteredPros.length === 1
                ? "profesional disponible"
                : "profesionales disponibles"}
              {zone ? ` en ${zone}` : ""}
            </p>
          </div>
        </div>

        {filteredPros.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No encontramos profesionales activos
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Probá seleccionando otra zona de Rosario o viendo todos los oficios.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPros.map((pro) => {
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
                <div
                  key={pro.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition"
                >
                  <div>
                    {/* Header de la tarjeta */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                        {pro.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg text-slate-900 truncate">
                          {pro.user.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {proTrades.map((tradeId) => {
                            const tradeMeta = TRADES.find((t) => t.id === tradeId);
                            return (
                              <span
                                key={tradeId}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                              >
                                <TradeIcon name={tradeId} className="h-3 w-3" />
                                {tradeMeta ? tradeMeta.name : tradeId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="mt-4 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {pro.description}
                    </p>

                    {/* Zonas de Rosario */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700">
                          Zonas de cobertura:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {proZones.map((z) => (
                          <span
                            key={z}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            {z}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="mt-6 pt-4">
                    <Link
                      href={`/profesionales/${pro.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-blue-600 transition"
                    >
                      <span>Ver perfil y solicitar</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Banner de propuesta de valor simple del MVP */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold">
              ¿Cómo funciona Oficios Express?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300">
              Un proceso simple, sin comisiones escondidas ni intermediarios complicados.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">1. Elegí el profesional</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Revisá los oficios y zonas de Rosario donde trabaja el profesional.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">2. Explicá tu necesidad</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enviá una solicitud breve con fotos opcionales de lo que necesitás arreglar.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">3. WhatsApp directo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cuando el profesional acepta, continúan la coordinación directamente por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
