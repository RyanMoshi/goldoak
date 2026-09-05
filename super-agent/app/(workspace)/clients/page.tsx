import { Users } from "lucide-react";
import type { Metadata } from "next";
import { ComingNext } from "@/components/dashboard/ComingNext";
import { roadmap } from "@/data/roadmap";

const entry = roadmap["/clients"];

export const metadata: Metadata = { title: entry.title };

export default function ClientsPage() {
  return <ComingNext icon={Users} {...entry} />;
}
