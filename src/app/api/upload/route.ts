import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se enviaron archivos" }, { status: 400 });
    }

    // Limitar a 3 fotos por solicitud en el MVP
    const selectedFiles = files.slice(0, 3);
    const uploadedUrls: string[] = [];

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Máximo 5MB
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const uniqueName = `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${uniqueName}`);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (err) {
    console.error("Error al subir archivo:", err);
    return NextResponse.json({ error: "Error al procesar la imagen" }, { status: 500 });
  }
}
