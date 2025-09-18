import { redirect } from "next/navigation";
import { STATIONS } from "@/lib/stations";
export default function YpfMenuRoot({ searchParams }: { searchParams?: { station?: string } }) {
  const q = searchParams?.station?.toLowerCase();
  const slug = STATIONS.find(s => s.slug === q)?.slug || STATIONS[0].slug;
  redirect(`/ypf-menu/${slug}`);
}
