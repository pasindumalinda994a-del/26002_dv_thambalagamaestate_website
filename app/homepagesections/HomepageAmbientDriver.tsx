"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";
import {
  resetHomepageMix,
  setVelocityBump,
  setVillaProgress,
  setZoneWeights,
  smoothZoneWeights,
  smoothstep01,
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

const VISIBLE_FLOOR = 0.02;
const LATER_ZONE_BIAS = 0.12;

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
    if (frac <= VISIBLE_FLOOR) return;
    const eased = smoothstep01((frac - VISIBLE_FLOOR) / (1 - VISIBLE_FLOOR));
    const boosted = eased * (1 + index * LATER_ZONE_BIAS);
    weights[zone] = Math.max(weights[zone] ?? 0, boosted);
  });

  return weights;
}

function villaScrollProgress() {
  const el = document.querySelector('[data-ambient-zone="villa"]');
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const span = rect.height + viewportHeight;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(1, (viewportHeight - rect.top) / span));
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
      setVillaProgress(villaScrollProgress());
      if (self) setVelocityBump(velocityToBump(self.getVelocity()));
    };

    const tick = (_time: number, deltaTime: number) => {
      const dt = Math.min(0.1, Math.max(0, deltaTime / 1000));
      smoothZoneWeights(dt);
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
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      resetHomepageMix();
    };
  }, []);

  return null;
}
