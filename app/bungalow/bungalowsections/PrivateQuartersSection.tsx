"use client";

import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { H2 } from "../../components/H2";
import { BUNGALOW_QUARTERS } from "../content";

const LOOP_DURATION_SEC = 75;

const ROOM_ROMAN: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
};

function MarqueeSet({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 gap-3"
      aria-hidden={ariaHidden || undefined}
    >
      {BUNGALOW_QUARTERS.images.map((image) => (
        <div
          key={`${ariaHidden ? "dup-" : ""}${image.src}`}
          className="flex w-[min(85vw,468px)] shrink-0 flex-col gap-2 md:gap-3"
        >
          <div className="relative aspect-3/2 overflow-hidden bg-[#A6A6A6]">
            <Image
              src={image.src}
              alt={ariaHidden ? "" : image.alt}
              fill
              quality={75}
              sizes="468px"
              draggable={false}
              className="pointer-events-none select-none object-cover object-center"
            />
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-secondary text-xs font-medium uppercase leading-[150%] tracking-[0.2px] text-cream md:text-[13px]">
              {image.room != null
                ? `Room ${ROOM_ROMAN[image.room]}`
                : "Bathroom"}
            </p>
            <p className="text-right font-secondary text-xs font-medium uppercase leading-[150%] tracking-[0.2px] text-cream md:text-[13px]">
              {image.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PrivateQuartersSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    gsap.registerPlugin(Draggable, InertiaPlugin);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const proxy = document.createElement("div");
    const setTrackX = gsap.quickSetter(track, "x", "px");
    let loopWidth = 0;
    let paused = false;

    gsap.set(track, { force3D: true });

    const getProxyX = () => Number(gsap.getProperty(proxy, "x")) || 0;

    const applyWrap = () => {
      if (!loopWidth) return;
      setTrackX(gsap.utils.wrap(-loopWidth, 0, getProxyX()));
    };

    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const second = track.children[1] as HTMLElement | undefined;
      if (!first || !second) return;
      loopWidth = second.offsetLeft - first.offsetLeft;
      applyWrap();
    };

    measure();

    const tick = () => {
      if (paused || reduceMotion || !loopWidth) return;
      const pixelsPerSecond = loopWidth / LOOP_DURATION_SEC;
      gsap.set(proxy, {
        x: getProxyX() - (pixelsPerSecond / 60) * gsap.ticker.deltaRatio(60),
      });
      applyWrap();
    };

    gsap.ticker.add(tick);

    const [draggable] = Draggable.create(proxy, {
      trigger: viewport,
      type: "x",
      inertia: true,
      cursor: "grab",
      activeCursor: "grabbing",
      allowNativeTouchScrolling: false,
      minimumMovement: 0,
      zIndexBoost: false,
      onPress() {
        paused = true;
        gsap.killTweensOf(proxy);
      },
      onDrag: applyWrap,
      onThrowUpdate: applyWrap,
      onThrowComplete() {
        paused = false;
      },
      onRelease() {
        if (!this.tween) paused = false;
      },
    });

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);

    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
      draggable.kill();
      gsap.killTweensOf(proxy);
      gsap.set(track, { x: 0 });
    };
  }, []);

  return (
    <section
      aria-label="Private quarters"
      className="bg-deep-forest px-5 py-16 md:px-8 md:py-24"
    >
      <H2 className="mb-8 max-w-[678px] uppercase text-cream md:mb-14">
        {BUNGALOW_QUARTERS.headline}
      </H2>

      <div
        ref={viewportRef}
        className="relative -mx-5 w-[calc(100%+2.5rem)] cursor-grab overflow-hidden touch-none select-none active:cursor-grabbing md:-mx-8 md:w-[calc(100%+4rem)]"
      >
        <div ref={trackRef} className="flex w-max gap-3">
          <MarqueeSet />
          <MarqueeSet ariaHidden />
        </div>
      </div>
    </section>
  );
}
