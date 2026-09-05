import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { ComingNext } from "@/components/dashboard/ComingNext";
import { roadmap } from "@/data/roadmap";

const entry = roadmap["/settings"];

export const metadata: Metadata = { title: entry.title };

export default function SettingsPage() {
  return <ComingNext icon={Settings} {...entry} />;
}
