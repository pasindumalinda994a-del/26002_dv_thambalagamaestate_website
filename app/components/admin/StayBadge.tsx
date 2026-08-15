import type { StayPhase } from "./booking-ops";

const LABELS: Record<StayPhase, string> = {
  arriving: "Arriving today",
  in_house: "In house",
  departing: "Checking out",
  upcoming: "Upcoming",
  past: "Past",
};

const STYLES: Record<StayPhase, string> = {
  arriving: "bg-olive/15 text-olive",
  in_house: "bg-forest-green/10 text-forest-green",
  departing: "bg-tan/40 text-forest-green",
  upcoming: "border border-forest-green/20 text-forest-green/70",
  past: "bg-forest-green/5 text-forest-green/45",
};

export function StayBadge({ phase }: { phase: StayPhase }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 font-secondary text-[10px] font-medium uppercase tracking-[0.12em]",
        STYLES[phase],
      ].join(" ")}
    >
      {LABELS[phase]}
    </span>
  );
}
