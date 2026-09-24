"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface ProfileActionResult {
  error?: string;
  success?: boolean;
}

export async function updateProfessionalProfileAction(
  prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  const session = await getSession();
  if (!session) {
    return { error: "No autorizado" };
  }

  const description = formData.get("description")?.toString().trim();
  const whatsapp = formData.get("whatsapp")?.toString().trim();
  const trades = formData.getAll("trades").map(String);
  const zones = formData.getAll("zones").map(String);

  if (!description || !whatsapp) {
    return { error: "La descripción y el número de WhatsApp son obligatorios." };
  }

  if (trades.length === 0) {
    return { error: "Seleccioná al menos un oficio que realices." };
  }

  if (zones.length === 0) {
    return { error: "Seleccioná al menos una zona de Rosario donde trabajás." };
  }

  // Sanitizar número de WhatsApp (solo dígitos)
  const cleanWhatsapp = whatsapp.replace(/\D/g, "");

  await prisma.professionalProfile.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      description,
      whatsapp: cleanWhatsapp,
      trades: JSON.stringify(trades),
      zones: JSON.stringify(zones),
      isActive: true,
    },
    update: {
      description,
      whatsapp: cleanWhatsapp,
      trades: JSON.stringify(trades),
      zones: JSON.stringify(zones),
    },
  });

  revalidatePath("/panel/perfil");
  revalidatePath("/");

  return { success: true };
}

export async function toggleProfessionalAvailabilityAction(
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.professionalProfile.update({
    where: { userId: session.userId },
    data: { isActive },
  });

  revalidatePath("/panel/perfil");
  revalidatePath("/panel/solicitudes");
  revalidatePath("/");

  return { success: true };
}
