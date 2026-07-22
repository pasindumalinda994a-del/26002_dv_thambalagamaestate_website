"use client";

type GuestStepperProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
};

export function GuestStepper({
  label,
  value,
  min = 0,
  max = 18,
  onChange,
}: GuestStepperProps) {
  const canDec = value > min;
  const canInc = value < max;

  return (
    <div className="flex items-center gap-4">
      <span className="shrink-0 font-secondary text-[16px] font-semibold text-[#7C7F78]">
        {label}
      </span>
      <div className="flex h-11 w-[120px] shrink-0 items-stretch border border-forest-green/25">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={!canDec}
          onClick={() => onChange(value - 1)}
          className="flex w-10 items-center justify-center font-secondary text-[16px] font-semibold text-[#7C7F78] transition-opacity hover:opacity-70 disabled:opacity-30"
        >
          −
        </button>
        <span className="flex flex-1 items-center justify-center border-x border-forest-green/25 font-secondary text-[16px] font-semibold text-[#7C7F78]">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={!canInc}
          onClick={() => onChange(value + 1)}
          className="flex w-10 items-center justify-center font-secondary text-[16px] font-semibold text-[#7C7F78] transition-opacity hover:opacity-70 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
