import { providers } from "@/data/providers";
import { Provider } from "./types";

export function getProvider(name: string): Provider | null {
  return providers.find((provider) => provider.name === name) || null;
}
