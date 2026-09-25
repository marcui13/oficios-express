const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Directorio del proyecto mobile y raíz del monorepo
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Escuchar cambios en todo el monorepo (para HMR de @oficios/shared)
config.watchFolders = [monorepoRoot];

// 2. Permitir que Metro resuelva paquetes hoisted en la raíz
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
