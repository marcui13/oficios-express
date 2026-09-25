import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { professionalProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Si es profesional, traer las solicitudes dirigidas a su perfil profesional
    if (user.role === "professional" && user.professionalProfile) {
      const requests = await prisma.contactRequest.findMany({
        where: { professionalId: user.professionalProfile.id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = requests.map((req) => {
        let photos: string[] = [];
        if (req.photos) {
          try {
            photos = JSON.parse(req.photos);
          } catch {
            photos = [];
          }
        }
        return {
          id: req.id,
          clientId: req.clientId,
          professionalId: req.professionalId,
          trade: req.trade,
          description: req.description,
          photos,
          status: req.status,
          createdAt: req.createdAt,
          client: req.client,
        };
      });

      return NextResponse.json({ success: true, data: formatted });
    }

    // Por defecto (cliente): traer las solicitudes enviadas por el cliente
    const requests = await prisma.contactRequest.findMany({
      where: { clientId: user.id },
      include: {
        professional: {
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = requests.map((req) => {
      let photos: string[] = [];
      if (req.photos) {
        try {
          photos = JSON.parse(req.photos);
        } catch {
          photos = [];
        }
      }

      let trades: string[] = [];
      let zones: string[] = [];
      try {
        trades = JSON.parse(req.professional.trades);
      } catch {
        trades = [];
      }
      try {
        zones = JSON.parse(req.professional.zones);
      } catch {
        zones = [];
      }

      return {
        id: req.id,
        clientId: req.clientId,
        professionalId: req.professionalId,
        trade: req.trade,
        description: req.description,
        photos,
        status: req.status,
        createdAt: req.createdAt,
        professional: {
          id: req.professional.id,
          userId: req.professional.userId,
          description: req.professional.description,
          trades,
          zones,
          whatsapp: req.professional.whatsapp,
          isActive: req.professional.isActive,
          user: req.professional.user,
        },
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Tenés que iniciar sesión para enviar una solicitud" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const professionalId = body.professionalId?.toString();
    const trade = body.trade?.toString();
    const description = body.description?.toString()?.trim();
    const photos: string[] = Array.isArray(body.photos) ? body.photos : [];

    if (!professionalId || !trade || !description) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios (profesional, oficio o descripción)" },
        { status: 400 }
      );
    }

    const pro = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
    });

    if (!pro) {
      return NextResponse.json(
        { success: false, error: "El profesional seleccionado no existe" },
        { status: 404 }
      );
    }

    if (pro.userId === session.userId) {
      return NextResponse.json(
        { success: false, error: "No podés enviarte una solicitud a vos mismo" },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: "Solicitud enviada con éxito",
    });
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
