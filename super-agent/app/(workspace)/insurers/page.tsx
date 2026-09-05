import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import { ComingNext } from "@/components/dashboard/ComingNext";
import { roadmap } from "@/data/roadmap";

const entry = roadmap["/insurers"];

export const metadata: Metadata = { title: entry.title };

export default function InsurersPage() {
  return <ComingNext icon={Building2} {...entry} />;
}
