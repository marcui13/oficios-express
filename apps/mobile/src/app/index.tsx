import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TRADES, ROSARIO_DISTRICTS, ProfessionalProfileSummary } from "@oficios/shared";
import { api } from "@/services/api";

// Datos locales de fallback para Rosario si la API no está disponible
const ROSARIO_FALLBACK_PROS: ProfessionalProfileSummary[] = [
  {
    id: "pro_roberto",
    userId: "usr_roberto",
    description: "Plomero matriculado y gasista con más de 15 años de experiencia en reparaciones de urgencia en Rosario.",
    trades: ["plomeria", "gas"],
    zones: ["Distrito Centro", "Distrito Norte"],
    whatsapp: "5493415551234",
    isActive: true,
    user: { id: "usr_roberto", name: "Roberto Gómez", email: "roberto@pro.com", phone: "3415551234", role: "professional" },
  },
  {
    id: "pro_carlos",
    userId: "usr_carlos",
    description: "Electricista matriculado. Instalaciones domiciliarias, recableados, tableros y emergencias eléctricas.",
    trades: ["electricidad"],
    zones: ["Distrito Centro", "Distrito Oeste"],
    whatsapp: "5493415555678",
    isActive: true,
    user: { id: "usr_carlos", name: "Carlos Fernández", email: "carlos@pro.com", phone: "3415555678", role: "professional" },
  },
  {
    id: "pro_martin",
    userId: "usr_martin",
    description: "Albañilería y pintura en general. Refacciones de cocinas, baños, arreglos de humedad y frentes.",
    trades: ["albanileria", "pintura"],
    zones: ["Distrito Sur", "Distrito Sudoeste"],
    whatsapp: "5493415559012",
    isActive: true,
    user: { id: "usr_martin", name: "Martín Lucero", email: "martin@pro.com", phone: "3415559012", role: "professional" },
  },
  {
    id: "pro_lucas",
    userId: "usr_lucas",
    description: "Cerrajería 24hs en toda la ciudad de Rosario. Aperturas de casas, autos y cajas fuertes sin romper.",
    trades: ["cerrajeria"],
    zones: ["Distrito Centro", "Distrito Norte", "Distrito Sur", "Distrito Noroeste", "Distrito Oeste", "Distrito Sudoeste"],
    whatsapp: "5493415553456",
    isActive: true,
    user: { id: "usr_lucas", name: "Lucas Rossi", email: "lucas@pro.com", phone: "3415553456", role: "professional" },
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedTrade, setSelectedTrade] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [professionals, setProfessionals] = useState<ProfessionalProfileSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const fetchProfessionals = useCallback(async () => {
    try {
      const res = await api.getProfessionals({
        trade: selectedTrade !== "all" ? selectedTrade : undefined,
        zone: selectedZone !== "all" ? selectedZone : undefined,
      });

      if (res.success && res.data && res.data.length > 0) {
        setProfessionals(res.data);
        setIsUsingFallback(false);
      } else if (res.success && res.data) {
        setProfessionals([]);
        setIsUsingFallback(false);
      } else {
        // Fallback local con filtro
        filterFallbackPros();
      }
    } catch {
      filterFallbackPros();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTrade, selectedZone]);

  const filterFallbackPros = () => {
    let filtered = ROSARIO_FALLBACK_PROS;
    if (selectedTrade !== "all") {
      filtered = filtered.filter((p) => p.trades.includes(selectedTrade));
    }
    if (selectedZone !== "all") {
      filtered = filtered.filter((p) => p.zones.includes(selectedZone));
    }
    setProfessionals(filtered);
    setIsUsingFallback(true);
  };

  useEffect(() => {
    setLoading(true);
    fetchProfessionals();
  }, [fetchProfessionals]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfessionals();
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Hola ${name}, te contacto desde la app de Oficios Express Rosario para consultar por un trabajo.`);
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>Oficios Express</Text>
            <View style={styles.badgeCity}>
              <Text style={styles.badgeCityText}>Rosario, SF</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Conectá directo con profesionales de confianza para arreglos en tu hogar.
          </Text>
        </View>

        {isUsingFallback && (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineText}>
              Modo demostración (mostrando profesionales de prueba de Rosario).
            </Text>
          </View>
        )}

        {/* Filtro de Oficios */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Oficio</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={[styles.chip, selectedTrade === "all" && styles.chipActive]}
            onPress={() => setSelectedTrade("all")}
          >
            <Text style={[styles.chipText, selectedTrade === "all" && styles.chipTextActive]}>
              Todos los oficios
            </Text>
          </TouchableOpacity>
          {TRADES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, selectedTrade === t.id && styles.chipActive]}
              onPress={() => setSelectedTrade(t.id)}
            >
              <Text style={[styles.chipText, selectedTrade === t.id && styles.chipTextActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filtro de Distritos de Rosario */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distrito de Rosario</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={[styles.chip, selectedZone === "all" && styles.chipActive]}
            onPress={() => setSelectedZone("all")}
          >
            <Text style={[styles.chipText, selectedZone === "all" && styles.chipTextActive]}>
              Toda la ciudad
            </Text>
          </TouchableOpacity>
          {ROSARIO_DISTRICTS.map((z) => (
            <TouchableOpacity
              key={z}
              style={[styles.chip, selectedZone === z && styles.chipActive]}
              onPress={() => setSelectedZone(z)}
            >
              <Text style={[styles.chipText, selectedZone === z && styles.chipTextActive]}>
                {z.replace("Distrito ", "")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de Profesionales */}
        <View style={styles.prosContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Profesionales ({professionals.length})
            </Text>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loaderText}>Buscando en Rosario...</Text>
            </View>
          ) : professionals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No se encontraron profesionales</Text>
              <Text style={styles.emptySubtitle}>
                Probá cambiando el oficio o seleccionando toda la ciudad.
              </Text>
            </View>
          ) : (
            professionals.map((pro) => (
              <View key={pro.id} style={styles.proCard}>
                <View style={styles.proHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {pro.user?.name ? pro.user.name.charAt(0).toUpperCase() : "P"}
                    </Text>
                  </View>
                  <View style={styles.proInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.proName}>{pro.user?.name || "Profesional"}</Text>
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ Verificado</Text>
                      </View>
                    </View>
                    <Text style={styles.proPhone}>WhatsApp: {pro.whatsapp}</Text>
                  </View>
                </View>

                <Text style={styles.proDescription} numberOfLines={3}>
                  {pro.description}
                </Text>

                {/* Oficios del profesional */}
                <View style={styles.tagsRow}>
                  {pro.trades.map((tr) => {
                    const tradeInfo = TRADES.find((t) => t.id === tr);
                    return (
                      <View key={tr} style={styles.tradeTag}>
                        <Text style={styles.tradeTagText}>
                          {tradeInfo?.name || tr}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Zonas de Rosario */}
                <View style={styles.zonesRow}>
                  <Text style={styles.zonesLabel}>Zonas: </Text>
                  <Text style={styles.zonesText}>
                    {pro.zones.map((z) => z.replace("Distrito ", "")).join(", ")}
                  </Text>
                </View>

                {/* Botones de acción */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => router.push(`/profesional/${pro.id}`)}
                  >
                    <Text style={styles.btnSecondaryText}>Ver Perfil</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnWhatsApp}
                    onPress={() => openWhatsApp(pro.whatsapp, pro.user?.name || "profesional")}
                  >
                    <Text style={styles.btnWhatsAppText}>💬 WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  badgeCity: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  badgeCityText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  offlineNotice: {
    backgroundColor: "#fef3c7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  offlineText: {
    color: "#92400e",
    fontSize: 12,
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  prosContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
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
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  proCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
    elevation: 1,
  },
  proHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
  proInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  verifiedBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: "#15803d",
    fontWeight: "600",
  },
  proPhone: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  proDescription: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  tradeTag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tradeTagText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  zonesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  zonesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  zonesText: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
  btnWhatsApp: {
    flex: 1.2,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#16a34a",
    alignItems: "center",
  },
  btnWhatsAppText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
});
