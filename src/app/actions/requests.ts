"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface RequestActionResult {
  error?: string;
  success?: boolean;
  requestId?: string;
}

export async function createContactRequestAction(
  prevState: RequestActionResult | null,
  formData: FormData
): Promise<RequestActionResult> {
  const session = await getSession();
  if (!session) {
    return { error: "Tenés que iniciar sesión o registrarte para enviar una solicitud." };
  }

  const professionalId = formData.get("professionalId")?.toString();
  const trade = formData.get("trade")?.toString();
  const description = formData.get("description")?.toString().trim();
  const photosJson = formData.get("photos")?.toString();

  if (!professionalId || !trade || !description) {
    return { error: "Por favor indicá el oficio y describí brevemente lo que necesitás." };
  }

  const pro = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
  });

  if (!pro) {
    return { error: "El profesional seleccionado no existe." };
  }

  if (pro.userId === session.userId) {
    return { error: "No podés enviarte una solicitud a vos mismo." };
  }

  let photos: string[] = [];
  if (photosJson) {
    try {
      const parsed = JSON.parse(photosJson);
      if (Array.isArray(parsed)) {
        photos = parsed;
      }
    } catch {
      // Ignorar error de parsing
    }
  }

  const newRequest = await prisma.contactRequest.create({
    data: {
      clientId: session.userId,
      professionalId,
      trade,
      description,
      photos: photos.length > 0 ? JSON.stringify(photos) : null,
      status: "pending",
    },
  });

  revalidatePath("/mis-solicitudes");
  revalidatePath(`/profesionales/${professionalId}`);

  return { success: true, requestId: newRequest.id };
}

export async function updateRequestStatusAction(
  requestId: string,
  newStatus: "accepted" | "rejected"
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "No autorizado" };
  }

  const request = await prisma.contactRequest.findUnique({
    where: { id: requestId },
    include: { professional: true },
  });

  if (!request) {
    return { success: false, error: "Solicitud no encontrada" };
  }

  if (request.professional.userId !== session.userId) {
    return { success: false, error: "No tenés permiso para responder esta solicitud" };
  }

  await prisma.contactRequest.update({
    where: { id: requestId },
    data: { status: newStatus },
  });

  revalidatePath("/panel/solicitudes");
  revalidatePath("/mis-solicitudes");

  return { success: true };
}
