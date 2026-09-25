import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toString().trim().toLowerCase();
    const password = body.password?.toString();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        professionalProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    let professionalProfile = null;
    if (user.professionalProfile) {
      let trades: string[] = [];
      let zones: string[] = [];
      try {
        trades = JSON.parse(user.professionalProfile.trades);
      } catch {
        trades = [];
      }
      try {
        zones = JSON.parse(user.professionalProfile.zones);
      } catch {
        zones = [];
      }
      professionalProfile = {
        id: user.professionalProfile.id,
        description: user.professionalProfile.description,
        trades,
        zones,
        whatsapp: user.professionalProfile.whatsapp,
        isActive: user.professionalProfile.isActive,
      };
    }

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        professionalProfile,
      },
    });
  } catch (error) {
    console.error("Error en /api/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
