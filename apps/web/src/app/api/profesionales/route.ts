import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trade = searchParams.get("trade");
    const zone = searchParams.get("zone");

    const allPros = await prisma.professionalProfile.findMany({
      where: {
        isActive: true,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedPros = allPros
      .map((pro) => {
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

        return {
          id: pro.id,
          userId: pro.userId,
          description: pro.description,
          trades,
          zones,
          whatsapp: pro.whatsapp,
          isActive: pro.isActive,
          user: pro.user,
        };
      })
      .filter((pro) => {
        let matchTrade = true;
        let matchZone = true;

        if (trade && trade !== "all") {
          matchTrade = pro.trades.includes(trade);
        }

        if (zone && zone !== "all") {
          matchZone = pro.zones.includes(zone);
        }

        return matchTrade && matchZone;
      });

    return NextResponse.json({
      success: true,
      data: formattedPros,
    });
  } catch (error) {
    console.error("Error al obtener profesionales:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener profesionales" },
      { status: 500 }
    );
  }
}
