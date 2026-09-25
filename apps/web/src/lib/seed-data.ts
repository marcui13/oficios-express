import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function runSeed(prisma: PrismaClient, force = false) {
  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0 && !force) {
      return {
        alreadySeeded: true,
        userCount: existingUsers,
        message: `La base de datos ya contiene ${existingUsers} usuario(s). Seed omitido para no sobrescribir datos reales.`,
      };
    }
  } catch (err: any) {
    // Si la tabla aún no existe o falla la consulta, continuamos con el intento de creación
    console.log("ℹ️ No se pudo contar usuarios, procediendo a inicializar:", err.message);
  }

  console.log("🌱 Limpiando datos previos...");
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

  await prisma.user.create({
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
  });

  await prisma.user.create({
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
  });

  await prisma.user.create({
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
  });

  await prisma.user.create({
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

  return {
    alreadySeeded: false,
    message: "Base de datos inicializada correctamente con 5 profesionales y 1 cliente.",
    usersCreated: 6,
  };
}
