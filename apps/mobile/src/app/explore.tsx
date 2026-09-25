import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContactRequestSummary } from "@oficios/shared";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function RequestsScreen() {
  const { user, login, logout, isLoading: authLoading } = useAuth();

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Requests state
  const [requests, setRequests] = useState<ContactRequestSummary[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoadingRequests(true);
    try {
      const res = await api.getRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.warn("Error al cargar solicitudes:", err);
    } finally {
      setLoadingRequests(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  const handleLogin = async (customEmail?: string, customPassword?: string) => {
    setLoginError("");
    const targetEmail = customEmail || email;
    const targetPassword = customPassword || password;

    if (!targetEmail || !targetPassword) {
      setLoginError("Completá tu email y contraseña");
      return;
    }

    const res = await login({ email: targetEmail, password: targetPassword });
    if (!res.success) {
      setLoginError(res.error || "Credenciales incorrectas");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "accepted" | "rejected") => {
    try {
      const res = await api.updateRequestStatus(id, newStatus);
      if (res.success) {
        Alert.alert("Éxito", newStatus === "accepted" ? "Solicitud aceptada" : "Solicitud rechazada");
        fetchRequests();
      } else {
        Alert.alert("Error", res.error || "No se pudo actualizar el estado");
      }
    } catch {
      Alert.alert("Error", "Error de conexión");
    }
  };

  const openWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`);
  };

  // Si no está autenticado, mostrar pantalla de inicio de sesión
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Iniciar Sesión</Text>
            <Text style={styles.authSubtitle}>
              Ingresá con tu cuenta para ver y gestionar tus solicitudes en Rosario.
            </Text>

            {loginError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{loginError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.btnPrimary, authLoading && styles.btnDisabled]}
              onPress={() => handleLogin()}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Ingresar</Text>
              )}
            </TouchableOpacity>

            {/* Accesos rápidos de prueba de Rosario */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Cuentas demo de Rosario:</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  style={styles.btnDemo}
                  onPress={() => handleLogin("sofia@cliente.com", "password123")}
                >
                  <Text style={styles.btnDemoText}>👤 Sofía (Cliente)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnDemo}
                  onPress={() => handleLogin("roberto@pro.com", "password123")}
                >
                  <Text style={styles.btnDemoText}>🔧 Roberto (Profesional)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Usuario autenticado
  const isProfessional = user.role === "professional";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} />
        }
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userCardHeader}>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>
                {isProfessional ? "🔧 Profesional de Oficios" : "👤 Cliente"}
              </Text>
            </View>
            <TouchableOpacity style={styles.btnLogout} onPress={logout}>
              <Text style={styles.btnLogoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Solicitudes Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isProfessional ? "Solicitudes Recibidas" : "Mis Solicitudes Enviadas"}
          </Text>
        </View>

        {loadingRequests ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loaderText}>Actualizando solicitudes...</Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay solicitudes registradas</Text>
            <Text style={styles.emptySubtitle}>
              {isProfessional
                ? "Cuando los clientes soliciten presupuestos en tus zonas, aparecerán acá."
                : "Explorá profesionales en la pestaña principal y enviales una solicitud."}
            </Text>
          </View>
        ) : (
          requests.map((req) => {
            const isAccepted = req.status === "accepted";
            const isRejected = req.status === "rejected";

            return (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.tradeBadge}>
                    <Text style={styles.tradeBadgeText}>{req.trade.toUpperCase()}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isAccepted && styles.statusBadgeAccepted,
                      isRejected && styles.statusBadgeRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isAccepted && styles.statusTextAccepted,
                        isRejected && styles.statusTextRejected,
                      ]}
                    >
                      {isAccepted ? "Aceptada" : isRejected ? "Rechazada" : "Pendiente"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.requestDescription}>{req.description}</Text>

                {/* Info de la contraparte */}
                {isProfessional && req.client && (
                  <View style={styles.partyInfo}>
                    <Text style={styles.partyLabel}>Cliente: {req.client.name}</Text>
                    <Text style={styles.partyPhone}>Tel: {req.client.phone}</Text>
                  </View>
                )}

                {!isProfessional && req.professional?.user && (
                  <View style={styles.partyInfo}>
                    <Text style={styles.partyLabel}>Profesional: {req.professional.user.name}</Text>
                    <Text style={styles.partyPhone}>WhatsApp: {req.professional.whatsapp}</Text>
                  </View>
                )}

                {/* Acciones para el Profesional */}
                {isProfessional && !isAccepted && !isRejected && (
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.btnAccept}
                      onPress={() => handleStatusUpdate(req.id, "accepted")}
                    >
                      <Text style={styles.btnAcceptText}>✓ Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnReject}
                      onPress={() => handleStatusUpdate(req.id, "rejected")}
                    >
                      <Text style={styles.btnRejectText}>✕ Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Si está aceptada, botón para abrir WhatsApp */}
                {isAccepted && (
                  <TouchableOpacity
                    style={styles.btnWhatsAppRequest}
                    onPress={() => {
                      const targetPhone = isProfessional
                        ? req.client?.phone || ""
                        : req.professional?.whatsapp || "";
                      openWhatsApp(
                        targetPhone,
                        `Hola, te contacto sobre la solicitud de ${req.trade} en Oficios Express Rosario.`
                      );
                    }}
                  >
                    <Text style={styles.btnWhatsAppRequestText}>
                      💬 Abrir conversación en WhatsApp
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  authScroll: {
    padding: 20,
    justifyContent: "center",
    flexGrow: 1,
  },
  authCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 16,
  },
  errorBoxText: {
    color: "#b91c1c",
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 10,
    textAlign: "center",
  },
  demoButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  btnDemo: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  btnDemoText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "600",
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  userCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  userRole: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  btnLogout: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  btnLogoutText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  loaderContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  requestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tradeBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tradeBadgeText: {
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "bold",
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeAccepted: {
    backgroundColor: "#dcfce7",
  },
  statusBadgeRejected: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    color: "#b45309",
    fontSize: 11,
    fontWeight: "600",
  },
  statusTextAccepted: {
    color: "#15803d",
  },
  statusTextRejected: {
    color: "#b91c1c",
  },
  requestDescription: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 10,
  },
  partyInfo: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  partyLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  partyPhone: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  btnAccept: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  btnAcceptText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  btnReject: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  btnRejectText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  btnWhatsAppRequest: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  btnWhatsAppRequestText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
});
