type FeatureLabelRowProps = {
  labels: readonly string[];
  className?: string;
};

export function FeatureLabelRow({ labels, className }: FeatureLabelRowProps) {
  return (
    <div
      className={[
        "flex flex-col gap-3 border-t border-[#CFCBB1] pt-6 md:flex-row md:items-center md:justify-between md:gap-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {labels.map((label) => (
        <span
          key={label}
          className="font-secondary text-sm font-medium uppercase leading-[150%] tracking-[0.2px] text-deep-forest"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
