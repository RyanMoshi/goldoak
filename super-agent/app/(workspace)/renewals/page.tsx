import { RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import { ComingNext } from "@/components/dashboard/ComingNext";
import { roadmap } from "@/data/roadmap";

const entry = roadmap["/renewals"];

export const metadata: Metadata = { title: entry.title };

export default function RenewalsPage() {
  return <ComingNext icon={RefreshCw} {...entry} />;
}
