import { useContext } from "react";
import { LightingContext } from "../components/LightingProvider";

export function useLighting() {
  const context = useContext(LightingContext);
  if (!context) {
    throw new Error("useLighting must be used within a LightingProvider");
  }
  return context;
}
