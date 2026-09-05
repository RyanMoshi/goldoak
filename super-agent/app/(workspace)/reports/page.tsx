import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import { ComingNext } from "@/components/dashboard/ComingNext";
import { roadmap } from "@/data/roadmap";

const entry = roadmap["/reports"];

export const metadata: Metadata = { title: entry.title };

export default function ReportsPage() {
  return <ComingNext icon={BarChart3} {...entry} />;
}
