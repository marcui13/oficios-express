import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import { MapPin, Hammer, Inbox, UserCircle } from "lucide-react";

export async function Navbar() {
  const user = await getCurrentUser();
  const isProfessional = user?.role === "professional";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-3 sm:px-6">
        {/* Logo & Localización */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Hammer className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
              Oficios<span className="text-blue-600">Express</span>
            </span>
          </Link>
          <div className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            <MapPin className="h-3 w-3 text-blue-600" />
            Rosario
          </div>
        </div>

        {/* Links de Navegación */}
        <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {!user ? (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                Ingresar
              </Link>
              <Link
                href="/registro?role=professional"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <span className="hidden sm:inline">Soy profesional</span>
                <span className="sm:hidden">+ Soy Pro</span>
              </Link>
            </>
          ) : (
            <>
              {isProfessional ? (
                <>
                  <Link
                    href="/panel/solicitudes"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition px-2 py-1.5 rounded-lg hover:bg-slate-50"
                  >
                    <Inbox className="h-4 w-4 text-blue-600" />
                    <span className="hidden xs:inline sm:inline">Solicitudes</span>
                  </Link>
                  <Link
                    href="/panel/perfil"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition px-2 py-1.5 rounded-lg hover:bg-slate-50"
                  >
                    <UserCircle className="h-4 w-4 text-slate-500" />
                    <span className="hidden sm:inline">Mi Perfil</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/mis-solicitudes"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition px-2 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  <Inbox className="h-4 w-4 text-blue-600" />
                  <span>Mis Solicitudes</span>
                </Link>
              )}

              <div className="h-4 w-px bg-slate-200 mx-0.5" />
              <LogoutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
