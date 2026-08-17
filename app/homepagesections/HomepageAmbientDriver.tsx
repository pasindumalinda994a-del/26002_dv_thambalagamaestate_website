"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useState } from "react";
import {
  AMBIENT_SOUND_EVENT,
  type AmbientSoundDetail,
} from "@/lib/ambient-sound";
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

function zoneWeights(nodes: NodeListOf<Element>): ZoneWeights {
  const viewportHeight = window.innerHeight;
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

function villaScrollProgress(nodes: NodeListOf<Element>) {
  let el: Element | null = null;
  nodes.forEach((node) => {
    if (node.getAttribute("data-ambient-zone") === "villa") el = node;
  });
  if (!el) return 0;
  const rect = (el as Element).getBoundingClientRect();
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
  const [soundOn, setSoundOn] = useState(false);

  useLayoutEffect(() => {
    const handleAmbientSound = (event: Event) => {
      const detail = (event as CustomEvent<AmbientSoundDetail>).detail;
      if (!detail) return;
      setSoundOn(detail.enabled);
    };

    window.addEventListener(AMBIENT_SOUND_EVENT, handleAmbientSound);
    return () => {
      window.removeEventListener(AMBIENT_SOUND_EVENT, handleAmbientSound);
    };
  }, []);

  useLayoutEffect(() => {
    if (!soundOn) {
      resetHomepageMix();
      return;
    }

    ensureScrollTriggerConfig();
    gsap.registerPlugin(ScrollTrigger);

    let raf = 0;
    let pending: ScrollTrigger | undefined;

    const flush = () => {
      raf = 0;
      const self = pending;
      pending = undefined;
      const nodes = document.querySelectorAll("[data-ambient-zone]");
      setZoneWeights(zoneWeights(nodes));
      setVillaProgress(villaScrollProgress(nodes));
      if (self) setVelocityBump(velocityToBump(self.getVelocity()));
    };

    const update = (self?: ScrollTrigger) => {
      pending = self ?? pending;
      if (raf) return;
      raf = requestAnimationFrame(flush);
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
      cancelAnimationFrame(raf);
      gsap.ticker.remove(tick);
      trigger.kill();
      resetHomepageMix();
    };
  }, [soundOn]);

  return null;
}
