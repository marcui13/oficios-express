import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import { MapPin, Hammer, Inbox, UserCircle } from "lucide-react";

export async function Navbar() {
  const user = await getCurrentUser();
  const isProfessional = user?.role === "professional";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo & Localización */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Hammer className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                Oficios<span className="text-blue-600">Express</span>
              </span>
            </div>
          </Link>
          <div className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            <MapPin className="h-3 w-3 text-blue-600" />
            Rosario, SF
          </div>
        </div>

        {/* Links de Navegación */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition px-2 py-1"
          >
            Buscar
          </Link>

          {!user ? (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition px-2 py-1"
              >
                Ingresar
              </Link>
              <Link
                href="/registro?role=professional"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
              >
                Soy profesional
              </Link>
            </>
          ) : (
            <>
              {isProfessional ? (
                <>
                  <Link
                    href="/panel/solicitudes"
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 transition px-2 py-1"
                  >
                    <Inbox className="h-4 w-4" />
                    <span>Solicitudes</span>
                  </Link>
                  <Link
                    href="/panel/perfil"
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 transition px-2 py-1"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Mi Perfil</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/mis-solicitudes"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 transition px-2 py-1"
                >
                  <Inbox className="h-4 w-4" />
                  <span>Mis Solicitudes</span>
                </Link>
              )}

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs text-slate-500 font-medium truncate max-w-[120px]">
                  {user.name}
                </span>
                <LogoutButton />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
