import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { ComingNext } from "@/components/dashboard/ComingNext";
import { roadmap } from "@/data/roadmap";

const entry = roadmap["/claims"];

export const metadata: Metadata = { title: entry.title };

export default function ClaimsPage() {
  return <ComingNext icon={ShieldAlert} {...entry} />;
}
