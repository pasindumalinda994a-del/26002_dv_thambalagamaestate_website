import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonProps = ComponentProps<"button"> & {
  href?: string;
};

const arrowIcon = (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    className="shrink-0"
  >
    <path
      d="M13 18L19 12L13 6M19 12L5 12"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Button({
  className,
  children,
  type = "button",
  href,
  ...props
}: ButtonProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-full",
          "px-[18px] py-[12px]",
          "bg-cream text-forest-green",
          "font-secondary text-sm font-medium uppercase tracking-[0.2px]",
          "shadow-[0_4px_10px_0] shadow-black/8",
          "transition-opacity hover:opacity-90",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
        {arrowIcon}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full",
        "px-[18px] py-[12px]",
        "bg-cream text-forest-green",
        "font-secondary text-sm font-medium uppercase tracking-[0.2px]",
        "shadow-[0_4px_10px_0] shadow-black/8",
        "transition-opacity hover:opacity-90",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
      {arrowIcon}
    </button>
  );
}
