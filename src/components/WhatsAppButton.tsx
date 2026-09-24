import React from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export function WhatsAppButton({
  phone,
  message = "Hola, me contacto desde Oficios Express.",
  className = "",
  children,
}: WhatsAppButtonProps) {
  // Asegurarse de que el número comience con código de país de Argentina 54 si no lo tiene
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.slice(1);
  }
  if (!cleanPhone.startsWith("54")) {
    // Si viene como 341xxxxxxx o 9341xxxxxxx
    if (cleanPhone.startsWith("9")) {
      cleanPhone = `54${cleanPhone}`;
    } else {
      cleanPhone = `549${cleanPhone}`;
    }
  } else if (cleanPhone.startsWith("54") && !cleanPhone.startsWith("549")) {
    cleanPhone = `549${cleanPhone.slice(2)}`;
  }

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 active:scale-98 ${className}`}
    >
      <MessageCircle className="h-5 w-5 fill-current" />
      {children || <span>Contactar por WhatsApp</span>}
    </a>
  );
}
