export type UserRole = "client" | "professional" | "both";

export type RequestStatus = "pending" | "accepted" | "rejected";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface ProfessionalProfileSummary {
  id: string;
  userId: string;
  description: string;
  trades: string[];
  zones: string[];
  whatsapp: string;
  isActive: boolean;
  user?: UserSummary;
}

export interface ContactRequestSummary {
  id: string;
  clientId: string;
  professionalId: string;
  trade: string;
  description: string;
  photos?: string[];
  status: RequestStatus | string;
  createdAt: string | Date;
  client?: UserSummary;
  professional?: ProfessionalProfileSummary;
}

// Interfaz estándar para respuestas de API REST
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Payloads de requests de la API
export interface LoginRequestPayload {
  email: string;
  password: string;
}

export interface RegisterRequestPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  // Campos opcionales si se registra como profesional
  description?: string;
  trades?: string[];
  zones?: string[];
  whatsapp?: string;
}

export interface CreateContactRequestPayload {
  professionalId: string;
  trade: string;
  description: string;
  photos?: string[];
}
