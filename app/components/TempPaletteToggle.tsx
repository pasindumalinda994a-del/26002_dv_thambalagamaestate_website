"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TempPalette = "light" | "dark";

type TempPaletteContextValue = {
  palette: TempPalette;
  toggle: () => void;
};

const TempPaletteContext = createContext<TempPaletteContextValue | null>(null);

export function TempPaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState<TempPalette>("light");

  const toggle = useCallback(() => {
    setPalette((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(() => ({ palette, toggle }), [palette, toggle]);

  return (
    <TempPaletteContext.Provider value={value}>
      {children}
    </TempPaletteContext.Provider>
  );
}

export function useTempPalette(): TempPaletteContextValue {
  const ctx = useContext(TempPaletteContext);
  if (!ctx) {
    return {
      palette: "light",
      toggle: () => {},
    };
  }
  return ctx;
}

/** Temporary A/B palette switcher — remove once a palette is chosen. */
export function TempPaletteToggle() {
  const { palette, toggle } = useTempPalette();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${palette === "light" ? "dark" : "light"} palette`}
      aria-pressed={palette === "dark"}
      className={[
        "fixed bottom-4 left-4 z-[502]",
        "rounded-md px-3 py-2",
        "font-secondary text-xs font-medium uppercase tracking-[0.15em]",
        "bg-deep-forest text-cream ring-1 ring-cream/40",
        "transition-opacity hover:opacity-80",
      ].join(" ")}
    >
      {palette === "light" ? "Light" : "Dark"}
    </button>
  );
}
