import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oficios Express — Profesionales de confianza en Rosario",
  description:
    "Conectá con plomeros, electricistas, gasistas, albañiles y más profesionales en Rosario, Santa Fe. Contacto directo por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Oficios Express — Rosario, Santa Fe.</span>
            <span>Conectando vecinos con profesionales de confianza.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
