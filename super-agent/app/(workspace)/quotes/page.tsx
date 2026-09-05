import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { ComingNext } from "@/components/dashboard/ComingNext";
import { roadmap } from "@/data/roadmap";

const entry = roadmap["/quotes"];

export const metadata: Metadata = { title: entry.title };

export default function QuotesPage() {
  return <ComingNext icon={FileText} {...entry} />;
}
