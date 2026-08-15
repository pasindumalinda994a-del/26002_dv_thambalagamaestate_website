"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../Button";

const COPIED_MS = 1500;

type CopyContactButtonProps = {
  label: string;
  copyValue: string;
  href: string;
  copyAriaLabel: string;
  variant: "link" | "button";
  target?: string;
  rel?: string;
  className?: string;
};

async function writeClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
}

export function CopyContactButton({
  label,
  copyValue,
  href,
  copyAriaLabel,
  variant,
  target,
  rel,
  className,
}: CopyContactButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function copy() {
    void writeClipboard(copyValue).then(() => {
      setCopied(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, COPIED_MS);
    });
  }

  const shown = copied ? "Copied" : label;

  if (variant === "link") {
    return (
      <>
        <a
          href={href}
          target={target}
          rel={rel}
          className={["md:hidden", className].filter(Boolean).join(" ")}
        >
          {label}
        </a>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : copyAriaLabel}
          className={["hidden md:inline-flex", className].filter(Boolean).join(" ")}
        >
          {shown}
        </button>
      </>
    );
  }

  return (
    <>
      <span className="flex-1 md:hidden">
        <Button
          href={href}
          target={target}
          rel={rel}
          variant="dark"
          size="small"
          showArrow={false}
          className={["w-full", className].filter(Boolean).join(" ")}
        >
          {label}
        </Button>
      </span>
      <span className="hidden md:inline-flex">
        <Button
          type="button"
          variant="dark"
          size="small"
          showArrow={false}
          onClick={copy}
          aria-label={copied ? "Copied" : copyAriaLabel}
          className={className}
        >
          {shown}
        </Button>
      </span>
    </>
  );
}
