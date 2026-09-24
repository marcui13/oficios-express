import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ProfessionalProfileForm } from "@/components/ProfessionalProfileForm";
import { ArrowLeft, UserCircle } from "lucide-react";

export default async function ProfessionalProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/panel/perfil");
  }

  const profile = user.professionalProfile;

  let trades: string[] = [];
  let zones: string[] = [];
  if (profile) {
    try {
      trades = JSON.parse(profile.trades);
    } catch {
      trades = [];
    }
    try {
      zones = JSON.parse(profile.zones);
    } catch {
      zones = [];
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/panel/solicitudes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a solicitudes
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserCircle className="h-7 w-7 text-blue-600" />
          <span>Configuración de Perfil Profesional</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Actualizá tus datos, oficios y zonas de trabajo en Rosario.
        </p>
      </div>

      <ProfessionalProfileForm
        initialDescription={profile?.description || ""}
        initialWhatsapp={profile?.whatsapp || user.phone}
        initialTrades={trades}
        initialZones={zones}
        initialIsActive={profile ? profile.isActive : true}
      />
    </div>
  );
}
