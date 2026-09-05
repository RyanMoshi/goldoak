import { redirect } from "next/navigation";

// The workspace opens on Today. The root has no content of its own.
export default function RootPage() {
  redirect("/today");
}
