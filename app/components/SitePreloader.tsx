"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { criticalAssetsForPath } from "@/lib/preload-assets";
import { Preloader } from "./Preloader";

const PreloaderCompleteContext = createContext(true);

export function usePreloaderComplete() {
  return useContext(PreloaderCompleteContext);
}

export function SitePreloader({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const skip = pathname.startsWith("/admin");
  const [complete, setComplete] = useState(skip);
  const assets = useMemo(() => criticalAssetsForPath(pathname), [pathname]);

  return (
    <PreloaderCompleteContext.Provider value={complete}>
      {!skip && !complete && (
        <Preloader assets={assets} onComplete={() => setComplete(true)} />
      )}
      {children}
    </PreloaderCompleteContext.Provider>
  );
}
