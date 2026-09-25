import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const status = body.status;

    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Estado inválido (debe ser 'accepted' o 'rejected')" },
        { status: 400 }
      );
    }

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id },
      include: {
        professional: true,
      },
    });

    if (!contactRequest) {
      return NextResponse.json(
        { success: false, error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    if (contactRequest.professional.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "No tenés permiso para responder esta solicitud" },
        { status: 403 }
      );
    }

    const updated = await prisma.contactRequest.update({
      where: { id },
      data: { status },
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
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: status === "accepted" ? "Solicitud aceptada" : "Solicitud rechazada",
    });
  } catch (error) {
    console.error("Error al responder solicitud:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
