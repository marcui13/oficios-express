import React from "react";
import {
  Wrench,
  Zap,
  Flame,
  Hammer,
  Paintbrush,
  KeyRound,
  Axe,
  Trees,
  Fan,
  Briefcase,
  LucideProps,
} from "lucide-react";

interface TradeIconProps extends LucideProps {
  name: string;
}

export function TradeIcon({ name, ...props }: TradeIconProps) {
  switch (name.toLowerCase()) {
    case "wrench":
    case "plomeria":
      return <Wrench {...props} />;
    case "zap":
    case "electricidad":
      return <Zap {...props} />;
    case "flame":
    case "gas":
      return <Flame {...props} />;
    case "hammer":
    case "albanileria":
      return <Hammer {...props} />;
    case "paintbrush":
    case "pintura":
      return <Paintbrush {...props} />;
    case "keyround":
    case "cerrajeria":
      return <KeyRound {...props} />;
    case "axe":
    case "carpinteria":
      return <Axe {...props} />;
    case "trees":
    case "jardineria":
      return <Trees {...props} />;
    case "fan":
    case "climatizacion":
      return <Fan {...props} />;
    default:
      return <Briefcase {...props} />;
  }
}
