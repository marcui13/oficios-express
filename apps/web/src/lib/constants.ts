export interface TradeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ROSARIO_DISTRICTS = [
  "Distrito Centro",
  "Distrito Norte",
  "Distrito Noroeste",
  "Distrito Oeste",
  "Distrito Sudoeste",
  "Distrito Sur",
] as const;

export type RosarioDistrict = (typeof ROSARIO_DISTRICTS)[number];

export const TRADES: TradeOption[] = [
  {
    id: "plomeria",
    name: "Plomería",
    description: "Reparación de cañerías, griferías, fugas y desagües.",
    icon: "Wrench",
  },
  {
    id: "electricidad",
    name: "Electricidad",
    description: "Instalaciones eléctricas, tableros, tomas, cortocircuitos.",
    icon: "Zap",
  },
  {
    id: "gas",
    name: "Gas",
    description: "Instalación de calefones, estufas, termotanques y fugas.",
    icon: "Flame",
  },
  {
    id: "albanileria",
    name: "Albañilería",
    description: "Refacciones, revoques, pisos, humedad y reparaciones.",
    icon: "Hammer",
  },
  {
    id: "pintura",
    name: "Pintura",
    description: "Pintura de interiores, exteriores, aberturas e impermeabilización.",
    icon: "Paintbrush",
  },
  {
    id: "cerrajeria",
    name: "Cerrajería",
    description: "Aperturas de urgencia, cambio de cerraduras y combinación.",
    icon: "KeyRound",
  },
  {
    id: "carpinteria",
    name: "Carpintería",
    description: "Muebles a medida, reparación de puertas, cajoneras y zócalos.",
    icon: "Axe",
  },
  {
    id: "jardineria",
    name: "Jardinería",
    description: "Corte de pasto, desmalezamiento, poda y mantenimiento general.",
    icon: "Trees",
  },
  {
    id: "climatizacion",
    name: "Climatización",
    description: "Instalación, carga de gas y mantenimiento de aire acondicionado.",
    icon: "Fan",
  },
];
