import type { Insurer, InsurerId } from "@/types/domain";

export const insurers: Record<InsurerId, Insurer> = {
  britam: { id: "britam", name: "Britam", monogram: "BRT" },
  jubilee: { id: "jubilee", name: "Jubilee", monogram: "JUB" },
  cic: { id: "cic", name: "CIC", monogram: "CIC" },
  apa: { id: "apa", name: "APA", monogram: "APA" },
  "old-mutual": { id: "old-mutual", name: "Old Mutual", monogram: "OM" },
  aig: { id: "aig", name: "AIG", monogram: "AIG" },
};

export function insurerName(id: InsurerId): string {
  return insurers[id].name;
}
