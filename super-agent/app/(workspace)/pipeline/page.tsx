import { KanbanSquare } from "lucide-react";
import type { Metadata } from "next";
import { ComingNext } from "@/components/dashboard/ComingNext";
import { roadmap } from "@/data/roadmap";

const entry = roadmap["/pipeline"];

export const metadata: Metadata = { title: entry.title };

export default function PipelinePage() {
  return <ComingNext icon={KanbanSquare} {...entry} />;
}
