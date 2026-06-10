import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "onDark" | "onCream";

export type ButtonProps = ComponentProps<"button"> & {
  href?: string;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  onDark: "bg-cream text-forest-green",
  onCream: "bg-forest-green text-cream",
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

function buttonClasses(variant: ButtonVariant, className?: string) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full",
    "px-[18px] py-[12px]",
    variantClasses[variant],
    "font-secondary text-sm font-medium uppercase tracking-[0.2px]",
    "shadow-[0_4px_10px_0] shadow-black/8",
    "transition-[opacity,background-color,color] duration-300 hover:opacity-90",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  className,
  children,
  type = "button",
  href,
  variant = "onDark",
  ...props
}: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={buttonClasses(variant, className)}>
        {children}
        {arrowIcon}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      {...props}
    >
      {children}
      {arrowIcon}
    </button>
  );
}
