"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";
import {
  resetHomepageMix,
  setVelocityBump,
  setZoneWeights,
  type AmbientZone,
  type ZoneWeights,
} from "@/lib/homepage-ambient-mix";
import { ensureScrollTriggerConfig } from "@/lib/scroll-refresh";

const ZONES = new Set<AmbientZone>([
  "hero",
  "about",
  "villa",
  "forest",
  "experience",
  "locationCta",
  "footer",
]);

function zoneFromElement(el: Element): AmbientZone | null {
  const zone = el.getAttribute("data-ambient-zone");
  if (zone && ZONES.has(zone as AmbientZone)) return zone as AmbientZone;
  return null;
}

function visibleFraction(rect: DOMRect, viewportHeight: number) {
  const visible = Math.max(
    0,
    Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
  );
  return visible / Math.max(1, viewportHeight);
}

function zoneWeights(): ZoneWeights {
  const viewportHeight = window.innerHeight;
  const nodes = document.querySelectorAll("[data-ambient-zone]");
  const weights: ZoneWeights = {};

  nodes.forEach((el, index) => {
    const zone = zoneFromElement(el);
    if (!zone) return;
    const rect = el.getBoundingClientRect();
    const frac = visibleFraction(rect, viewportHeight);
    if (frac <= 0.02) return;
    const boosted = frac * (1 + index * 0.35);
    weights[zone] = Math.max(weights[zone] ?? 0, boosted);
  });

  return weights;
}

function velocityToBump(velocity: number) {
  const speed = Math.abs(velocity);
  if (speed < 320) return 0;
  return Math.max(0, Math.min(1, (speed - 320) / 1400));
}

export function HomepageAmbientDriver() {
  useLayoutEffect(() => {
    ensureScrollTriggerConfig();
    gsap.registerPlugin(ScrollTrigger);

    const update = (self?: ScrollTrigger) => {
      setZoneWeights(zoneWeights());
      if (self) setVelocityBump(velocityToBump(self.getVelocity()));
    };

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: update,
      onRefresh: update,
    });

    update(trigger);

    return () => {
      trigger.kill();
      resetHomepageMix();
    };
  }, []);

  return null;
}
