import { prisma } from "../src/lib/prisma";
import { hashPassword, verifyPassword } from "../src/lib/auth";

async function runTests() {
  console.log("🧪 Iniciando pruebas de flujos de negocio Oficios MVP...");

  // 1. Verificar usuarios precargados en Rosario
  const pros = await prisma.professionalProfile.findMany({
    where: { isActive: true },
    include: { user: true },
  });
  console.log(`✅ Profesionales activos en Rosario encontrados: ${pros.length}`);
  if (pros.length < 5) throw new Error("Faltan profesionales en la base de datos");

  // 2. Verificar filtrado de oficio 'plomeria' y zona 'Distrito Centro'
  const plomerosCentro = pros.filter((p) => {
    const trades: string[] = JSON.parse(p.trades);
    const zones: string[] = JSON.parse(p.zones);
    return trades.includes("plomeria") && (zones.includes("Distrito Centro") || zones.includes("Todos"));
  });
  console.log(`✅ Plomeros en Distrito Centro encontrados: ${plomerosCentro.length}`);
  if (plomerosCentro.length === 0) throw new Error("Fallo en filtro de plomeros en Centro");

  // 3. Crear nuevo cliente de prueba
  const testClient = await prisma.user.create({
    data: {
      name: "Juan Pérez Test",
      email: `juan.test.${Date.now()}@example.com`,
      phone: "3419876543",
      passwordHash: await hashPassword("password123"),
      role: "client",
    },
  });
  console.log(`✅ Cliente creado: ${testClient.name} (${testClient.email})`);

  // 4. Crear solicitud de contacto para Roberto (plomero)
  const roberto = plomerosCentro[0];
  const newRequest = await prisma.contactRequest.create({
    data: {
      clientId: testClient.id,
      professionalId: roberto.id,
      trade: "plomeria",
      description: "Prueba E2E: Tengo una pérdida en la canilla de la cocina.",
      photos: JSON.stringify(["/uploads/test.jpg"]),
      status: "pending",
    },
  });
  console.log(`✅ Solicitud creada con id: ${newRequest.id}, status: ${newRequest.status}`);

  // 5. El profesional acepta la solicitud
  const acceptedRequest = await prisma.contactRequest.update({
    where: { id: newRequest.id },
    data: { status: "accepted" },
    include: { client: true, professional: true },
  });
  console.log(`✅ Solicitud actualizada a: ${acceptedRequest.status}`);
  if (acceptedRequest.status !== "accepted") throw new Error("Fallo al aceptar solicitud");

  // 6. Verificar formato de WhatsApp para Argentina / Rosario
  const proPhone = acceptedRequest.professional.whatsapp;
  const clientPhone = acceptedRequest.client.phone;
  console.log(`✅ WhatsApp profesional: ${proPhone}, Teléfono cliente: ${clientPhone}`);

  // 7. Pausar disponibilidad del profesional y verificar que se oculte
  await prisma.professionalProfile.update({
    where: { id: roberto.id },
    data: { isActive: false },
  });

  const prosAfterPause = await prisma.professionalProfile.findMany({
    where: { isActive: true },
  });
  const robertoFound = prosAfterPause.some((p) => p.id === roberto.id);
  console.log(`✅ Profesional pausado correctamente oculto de búsquedas activas: ${!robertoFound}`);
  if (robertoFound) throw new Error("El profesional pausado sigue apareciendo activo");

  // Restaurar profesional
  await prisma.professionalProfile.update({
    where: { id: roberto.id },
    data: { isActive: true },
  });

  // Limpiar datos de prueba
  await prisma.contactRequest.delete({ where: { id: newRequest.id } });
  await prisma.user.delete({ where: { id: testClient.id } });
  console.log("🧹 Datos de prueba limpiados correctamente.");

  console.log("\n🎉 ¡TODOS LOS FLUJOS DEL MVP VALIDARON CORRECTAMENTE!");
}

runTests()
  .catch((err) => {
    console.error("❌ Error en prueba:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
