import {
  ProfessionalProfileSummary,
  ContactRequestSummary,
  LoginRequestPayload,
  RegisterRequestPayload,
  CreateContactRequestPayload,
  ApiResponse,
} from "@oficios/shared";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Detección automática de la IP de tu Mac en la red Wi-Fi
// En dispositivos físicos (Expo Go), hostUri contiene la IP local de tu computadora (ej: 192.168.1.2)
function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(":")[0];
    if (hostIp) {
      return `http://${hostIp}:3000`;
    }
  }
  return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
}

export const API_BASE_URL = getBaseUrl();

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (err: any) {
    console.warn(`[API] Falló la petición a ${endpoint}:`, err?.message || err);
    return {
      success: false,
      error: "No se pudo conectar con el servidor de Rosario (verificá que Next.js esté corriendo)",
    };
  }
}

export const api = {
  // Profesionales
  async getProfessionals(params?: { trade?: string; zone?: string }): Promise<ApiResponse<ProfessionalProfileSummary[]>> {
    const query = new URLSearchParams();
    if (params?.trade && params.trade !== "all") query.set("trade", params.trade);
    if (params?.zone && params.zone !== "all") query.set("zone", params.zone);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return request<ProfessionalProfileSummary[]>(`/api/profesionales${queryString}`);
  },

  async getProfessionalById(id: string): Promise<ApiResponse<ProfessionalProfileSummary>> {
    return request<ProfessionalProfileSummary>(`/api/profesionales/${id}`);
  },

  // Auth
  async login(payload: LoginRequestPayload): Promise<ApiResponse<{ token: string; user: any }>> {
    const res = await request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  async register(payload: RegisterRequestPayload): Promise<ApiResponse<{ token: string; user: any }>> {
    const res = await request<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  // Solicitudes
  async getRequests(): Promise<ApiResponse<ContactRequestSummary[]>> {
    return request<ContactRequestSummary[]>("/api/solicitudes");
  },

  async createRequest(payload: CreateContactRequestPayload): Promise<ApiResponse<ContactRequestSummary>> {
    return request<ContactRequestSummary>("/api/solicitudes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateRequestStatus(id: string, status: "accepted" | "rejected"): Promise<ApiResponse<ContactRequestSummary>> {
    return request<ContactRequestSummary>(`/api/solicitudes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
