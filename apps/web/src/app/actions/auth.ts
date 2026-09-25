"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  removeSessionCookie,
  getSession,
} from "@/lib/auth";

export interface AuthState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "/";

  if (!email || !password) {
    return { error: "Por favor completá todos los campos." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { professionalProfile: true },
  });

  if (!user) {
    return { error: "Email o contraseña incorrectos." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Email o contraseña incorrectos." };
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  revalidatePath("/", "layout");

  // Redirección según rol o destino
  if (redirectTo && redirectTo !== "/login" && redirectTo !== "/registro") {
    redirect(redirectTo);
  }

  if (user.role === "professional" && user.professionalProfile) {
    redirect("/panel/solicitudes");
  }

  redirect("/");
}

export async function registerAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const phone = formData.get("phone")?.toString().trim();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() || "client";
  const trades = formData.getAll("trades").map(String);
  const zones = formData.getAll("zones").map(String);
  const description = formData.get("description")?.toString().trim() || "";
  const whatsapp = formData.get("whatsapp")?.toString().trim() || phone || "";

  if (!name || !email || !phone || !password) {
    return { error: "Por favor completá los datos básicos obligatorios." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe un usuario registrado con este correo." };
  }

  const passwordHash = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: role === "professional" ? "professional" : "client",
      ...(role === "professional"
        ? {
            professionalProfile: {
              create: {
                description:
                  description || "Profesional de oficios disponible en Rosario.",
                trades: JSON.stringify(trades.length > 0 ? trades : ["plomeria"]),
                zones: JSON.stringify(
                  zones.length > 0 ? zones : ["Distrito Centro"]
                ),
                whatsapp: whatsapp.replace(/\D/g, ""),
                isActive: true,
              },
            },
          }
        : {}),
    },
    include: { professionalProfile: true },
  });

  await setSessionCookie({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  });

  revalidatePath("/", "layout");

  if (newUser.role === "professional") {
    redirect("/panel/solicitudes");
  }

  redirect("/");
}

export async function logoutAction() {
  await removeSessionCookie();
  revalidatePath("/", "layout");
  redirect("/");
}
