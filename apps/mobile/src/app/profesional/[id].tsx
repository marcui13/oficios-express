import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TRADES, ProfessionalProfileSummary } from "@oficios/shared";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfessionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [pro, setPro] = useState<ProfessionalProfileSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedTrade, setSelectedTrade] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const res = await api.getProfessionalById(id);
        if (res.success && res.data) {
          setPro(res.data);
          if (res.data.trades.length > 0) {
            setSelectedTrade(res.data.trades[0]);
          }
        }
      } catch (err) {
        console.warn("Error al cargar profesional:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const openWhatsApp = () => {
    if (!pro) return;
    const cleanPhone = pro.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hola ${pro.user?.name || ""}, te contacto desde la app de Oficios Express Rosario para solicitar presupuesto.`
    );
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
  };

  const handleSendRequest = async () => {
    if (!selectedTrade) {
      Alert.alert("Atención", "Por favor seleccioná el oficio solicitado.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Atención", "Por favor describí brevemente lo que necesitás reparar.");
      return;
    }

    if (!user) {
      Alert.alert(
        "Inicio de sesión requerido",
        "Para dejar registrada una solicitud en el sistema necesitás iniciar sesión. ¿Querés contactar directamente por WhatsApp ahora?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir WhatsApp", onPress: openWhatsApp },
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createRequest({
        professionalId: pro!.id,
        trade: selectedTrade,
        description: description.trim(),
      });

      if (res.success) {
        Alert.alert(
          "¡Solicitud enviada!",
          "El profesional revisará tu pedido a la brevedad. Podés seguir el estado en la pestaña de Solicitudes.",
          [{ text: "OK", onPress: () => router.push("/explore") }]
        );
        setDescription("");
        setShowForm(false);
      } else {
        Alert.alert("Error", res.error || "No se pudo enviar la solicitud");
      }
    } catch {
      Alert.alert("Error", "Error de conexión con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (!pro) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Profesional no encontrado</Text>
        <TouchableOpacity style={styles.btnBack} onPress={() => router.back()}>
          <Text style={styles.btnBackText}>← Volver a explorar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {pro.user?.name || "Profesional"}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarBigText}>
              {pro.user?.name ? pro.user.name.charAt(0).toUpperCase() : "P"}
            </Text>
          </View>
          <Text style={styles.name}>{pro.user?.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Profesional Verificado en Rosario</Text>
            </View>
          </View>
          <Text style={styles.phoneText}>WhatsApp: {pro.whatsapp}</Text>
        </View>

        {/* WhatsApp Button Hero */}
        <TouchableOpacity style={styles.btnWhatsAppHero} onPress={openWhatsApp}>
          <Text style={styles.btnWhatsAppHeroText}>💬 Contactar directo por WhatsApp</Text>
        </TouchableOpacity>

        {/* Descripción */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Sobre este profesional</Text>
          <Text style={styles.descText}>{pro.description}</Text>
        </View>

        {/* Oficios */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Oficios que realiza</Text>
          <View style={styles.tagsContainer}>
            {pro.trades.map((tr) => {
              const tradeInfo = TRADES.find((t) => t.id === tr);
              return (
                <View key={tr} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tradeInfo?.name || tr}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Zonas de Rosario */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Zonas y distritos que atiende</Text>
          <View style={styles.tagsContainer}>
            {pro.zones.map((z) => (
              <View key={z} style={styles.zoneBadge}>
                <Text style={styles.zoneBadgeText}>{z}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Formulario de Solicitud de Arreglo */}
        <View style={styles.formCard}>
          <TouchableOpacity
            style={styles.formHeaderToggle}
            onPress={() => setShowForm(!showForm)}
          >
            <View>
              <Text style={styles.formCardTitle}>📋 Enviar Solicitud Formal</Text>
              <Text style={styles.formCardSubtitle}>
                Dejá registrado tu pedido en la plataforma para seguimiento.
              </Text>
            </View>
            <Text style={styles.toggleArrow}>{showForm ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {showForm && (
            <View style={styles.formBody}>
              <Text style={styles.inputLabel}>Seleccioná el oficio requerido:</Text>
              <View style={styles.tradePickerRow}>
                {pro.trades.map((tr) => {
                  const tradeInfo = TRADES.find((t) => t.id === tr);
                  const isSelected = selectedTrade === tr;
                  return (
                    <TouchableOpacity
                      key={tr}
                      style={[styles.pickerChip, isSelected && styles.pickerChipActive]}
                      onPress={() => setSelectedTrade(tr)}
                    >
                      <Text style={[styles.pickerChipText, isSelected && styles.pickerChipTextActive]}>
                        {tradeInfo?.name || tr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Describí el arreglo o problema:</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Ej: Tengo una fuga de agua abajo de la bacha de la cocina en barrio Pichincha..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity
                style={[styles.btnSubmit, submitting && styles.btnDisabled]}
                onPress={handleSendRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.btnSubmitText}>Enviar Solicitud</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  btnBack: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#2563eb",
    borderRadius: 8,
  },
  btnBackText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 15,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  avatarBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarBigText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  badgeRow: {
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "600",
  },
  phoneText: {
    color: "#64748b",
    fontSize: 14,
  },
  btnWhatsAppHero: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  btnWhatsAppHeroText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  tagText: {
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: "600",
  },
  zoneBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  zoneBadgeText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  formHeaderToggle: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  formCardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  toggleArrow: {
    fontSize: 14,
    color: "#64748b",
    paddingHorizontal: 8,
  },
  formBody: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    marginTop: 6,
  },
  tradePickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  pickerChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  pickerChipText: {
    fontSize: 13,
    color: "#475569",
  },
  pickerChipTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#0f172a",
    textAlignVertical: "top",
    minHeight: 90,
    marginBottom: 16,
  },
  btnSubmit: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnSubmitText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
