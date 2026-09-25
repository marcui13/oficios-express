import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const pro = await prisma.professionalProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!pro) {
      return NextResponse.json(
        { success: false, error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    let trades: string[] = [];
    let zones: string[] = [];
    try {
      trades = JSON.parse(pro.trades);
    } catch {
      trades = [];
    }
    try {
      zones = JSON.parse(pro.zones);
    } catch {
      zones = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        id: pro.id,
        userId: pro.userId,
        description: pro.description,
        trades,
        zones,
        whatsapp: pro.whatsapp,
        isActive: pro.isActive,
        user: pro.user,
      },
    });
  } catch (error) {
    console.error("Error al obtener detalle del profesional:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
