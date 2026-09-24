import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpiando base de datos...");
  await prisma.contactRequest.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("👤 Creando cliente de prueba...");
  const clientUser = await prisma.user.create({
    data: {
      name: "Sofía Martínez",
      email: "sofia@cliente.com",
      phone: "3415112233",
      passwordHash,
      role: "client",
    },
  });

  console.log("🔨 Creando profesionales en Rosario...");
  const pro1 = await prisma.user.create({
    data: {
      name: "Roberto Gómez",
      email: "roberto@pro.com",
      phone: "3416445566",
      passwordHash,
      role: "professional",
      professionalProfile: {
        create: {
          description:
            "Gasista matriculado y plomero con más de 15 años de experiencia en reparaciones hogareñas y edificios en Rosario.",
          trades: JSON.stringify(["plomeria", "gas"]),
          zones: JSON.stringify(["Distrito Centro", "Distrito Norte"]),
          whatsapp: "5493416445566",
          isActive: true,
        },
      },
    },
    include: { professionalProfile: true },
  });

  const pro2 = await prisma.user.create({
    data: {
      name: "Carlos Fernández",
      email: "carlos@pro.com",
      phone: "3417889900",
      passwordHash,
      role: "professional",
      professionalProfile: {
        create: {
          description:
            "Electricista domiciliario e industrial. Solución de cortocircuitos, recableados, armado de tableros y colocación de luminarias.",
          trades: JSON.stringify(["electricidad"]),
          zones: JSON.stringify(["Distrito Centro", "Distrito Oeste"]),
          whatsapp: "5493417889900",
          isActive: true,
        },
      },
    },
    include: { professionalProfile: true },
  });

  const pro3 = await prisma.user.create({
    data: {
      name: "Martín Lucero",
      email: "martin@pro.com",
      phone: "3413221144",
      passwordHash,
      role: "professional",
      professionalProfile: {
        create: {
          description:
            "Especialista en refacciones generales, revoques, colocación de cerámicos y pintura de frentes e interiores. Presupuesto sin cargo.",
          trades: JSON.stringify(["albanileria", "pintura"]),
          zones: JSON.stringify(["Distrito Sur", "Distrito Sudoeste"]),
          whatsapp: "5493413221144",
          isActive: true,
        },
      },
    },
    include: { professionalProfile: true },
  });

  const pro4 = await prisma.user.create({
    data: {
      name: "Lucas Rossi",
      email: "lucas@pro.com",
      phone: "3419998877",
      passwordHash,
      role: "professional",
      professionalProfile: {
        create: {
          description:
            "Cerrajería de urgencia 24hs. Aperturas sin rotura, cambio de combinaciones, cerraduras de seguridad para casas y comercios.",
          trades: JSON.stringify(["cerrajeria"]),
          zones: JSON.stringify([
            "Distrito Centro",
            "Distrito Norte",
            "Distrito Noroeste",
            "Distrito Oeste",
            "Distrito Sudoeste",
            "Distrito Sur",
          ]),
          whatsapp: "5493419998877",
          isActive: true,
        },
      },
    },
    include: { professionalProfile: true },
  });

  const pro5 = await prisma.user.create({
    data: {
      name: "Diego Morales",
      email: "diego@pro.com",
      phone: "3415554433",
      passwordHash,
      role: "professional",
      professionalProfile: {
        create: {
          description:
            "Mantenimiento de parques y jardines, poda de árboles en altura y servicio técnico de aire acondicionado (instalación y carga de gas).",
          trades: JSON.stringify(["jardineria", "climatizacion"]),
          zones: JSON.stringify(["Distrito Noroeste", "Distrito Norte"]),
          whatsapp: "5493415554433",
          isActive: true,
        },
      },
    },
    include: { professionalProfile: true },
  });

  console.log("📨 Creando solicitud de contacto de ejemplo...");
  if (pro1.professionalProfile) {
    await prisma.contactRequest.create({
      data: {
        clientId: clientUser.id,
        professionalId: pro1.professionalProfile.id,
        trade: "plomeria",
        description:
          "Hola Roberto, tengo una pérdida de agua constante debajo de la bacha de la cocina que está mojando el bajo mesada. ¿Podrías pasar a revisarlo?",
        status: "pending",
      },
    });
  }

  console.log("✅ Seed completado con éxito:");
  console.log("- Cliente: sofia@cliente.com / password123");
  console.log("- Profesional Roberto (Plomería/Gas): roberto@pro.com / password123");
  console.log("- Profesional Carlos (Electricidad): carlos@pro.com / password123");
  console.log("- Profesional Martín (Albañilería/Pintura): martin@pro.com / password123");
  console.log("- Profesional Lucas (Cerrajería): lucas@pro.com / password123");
  console.log("- Profesional Diego (Jardinería/Clima): diego@pro.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
