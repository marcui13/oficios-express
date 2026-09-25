import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name?.toString().trim();
    const email = body.email?.toString().trim().toLowerCase();
    const phone = body.phone?.toString().trim();
    const password = body.password?.toString();
    const role = body.role === "professional" ? "professional" : "client";
    const trades: string[] = Array.isArray(body.trades) ? body.trades : [];
    const zones: string[] = Array.isArray(body.zones) ? body.zones : [];
    const description = body.description?.toString().trim() || "";
    const whatsapp = (body.whatsapp?.toString().trim() || phone || "").replace(/\D/g, "");

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Por favor completá los datos básicos obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Ya existe un usuario registrado con este correo" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
        ...(role === "professional"
          ? {
              professionalProfile: {
                create: {
                  description: description || "Profesional de oficios disponible en Rosario.",
                  trades: JSON.stringify(trades.length > 0 ? trades : ["plomeria"]),
                  zones: JSON.stringify(zones.length > 0 ? zones : ["Distrito Centro"]),
                  whatsapp,
                  isActive: true,
                },
              },
            }
          : {}),
      },
      include: { professionalProfile: true },
    });

    const token = await signSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    let professionalProfile = null;
    if (newUser.professionalProfile) {
      let pTrades: string[] = [];
      let pZones: string[] = [];
      try {
        pTrades = JSON.parse(newUser.professionalProfile.trades);
      } catch {
        pTrades = [];
      }
      try {
        pZones = JSON.parse(newUser.professionalProfile.zones);
      } catch {
        pZones = [];
      }
      professionalProfile = {
        id: newUser.professionalProfile.id,
        description: newUser.professionalProfile.description,
        trades: pTrades,
        zones: pZones,
        whatsapp: newUser.professionalProfile.whatsapp,
        isActive: newUser.professionalProfile.isActive,
      };
    }

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        professionalProfile,
      },
    });
  } catch (error) {
    console.error("Error en /api/auth/register:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
