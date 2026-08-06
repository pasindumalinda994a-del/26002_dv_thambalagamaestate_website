import { LiveSoonPage } from "../components/LiveSoonPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Experiences",
  description:
    "Experiences at Thambalagama Estate near Sinharaja Forest Sri Lanka — coming soon.",
  path: "/experiences",
  robots: { index: false, follow: false },
});

export default function ExperiencesPage() {
  return <LiveSoonPage title="Experiences" />;
}
