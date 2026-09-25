import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleSeed(request);
}

export async function POST(request: Request) {
  return handleSeed(request);
}

async function handleSeed(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const force = searchParams.get("force") === "true";

  const validKey =
    process.env.SEED_SECRET ||
    process.env.JWT_SECRET ||
    "oficios-express-rosario-secret-key-mvp-2026";

  if (!key || key !== validKey) {
    return NextResponse.json(
      {
        error: "Acceso no autorizado",
        message:
          "Debes proporcionar el parámetro ?key=... con la clave de seguridad configurada en JWT_SECRET o SEED_SECRET.",
      },
      { status: 401 }
    );
  }

  try {
    const result = await runSeed(prisma, force);

    return NextResponse.json({
      success: true,
      ...result,
      credentials: {
        cliente: {
          email: "sofia@cliente.com",
          password: "password123",
          rol: "Cliente",
        },
        profesionales: [
          { email: "roberto@pro.com", password: "password123", rubros: ["Plomería", "Gas"] },
          { email: "carlos@pro.com", password: "password123", rubros: ["Electricidad"] },
          { email: "martin@pro.com", password: "password123", rubros: ["Albañilería", "Pintura"] },
          { email: "lucas@pro.com", password: "password123", rubros: ["Cerrajería"] },
          { email: "diego@pro.com", password: "password123", rubros: ["Jardinería", "Climatización"] },
        ],
      },
    });
  } catch (error: any) {
    console.error("Error en endpoint /api/seed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al inicializar la base de datos",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
