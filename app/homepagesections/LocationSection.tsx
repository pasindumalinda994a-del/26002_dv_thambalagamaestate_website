"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { forwardRef, useEffect, useRef } from "react";
const LOGO_SRC = "/Logo/Thambalagama%20Logo%202.png";
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";
const ESTATE_LNG = 80.403;
const ESTATE_LAT = 6.383;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${ESTATE_LAT},${ESTATE_LNG}`;
const MAPBOX_WORKER_URL = "/mapbox-gl-csp-worker.js";
const MARKER_PIN_SIZE_PX = 60;
const MARKER_PIN_CENTER = MARKER_PIN_SIZE_PX / 2;
const MARKER_OUTER_RING_R = 27;
const MARKER_OUTER_RING_STROKE = 1;
const MIDDLE_RING_BASE_R = 15;
const MARKER_CENTER_DOT_R = 7;
const MARKER_PULSE_DURATION = 2.8;
const MARKER_PULSE_EASE = "power2.out";

const LOCATION_ROWS = [
  { place: "Sinharaja Border", distance: "Direct Access" },
  { place: "Lankagama Gate", distance: "7 km (15-min drive)" },
  { place: "Colombo", distance: "X.X Hours" },
] as const;

function ExternalLinkIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M14 5H19V10M19 5L10 14M19 14V19H5V5H10"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function createMarkerPinElement(): {
  pin: HTMLDivElement;
  middleRing: SVGCircleElement;
} {
  const pin = document.createElement("div");
  pin.style.cssText =
    "position:relative;margin-top:0.35rem;display:flex;height:3.75rem;width:3.75rem;align-items:center;justify-content:center;";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", String(MARKER_PIN_SIZE_PX));
  svg.setAttribute("height", String(MARKER_PIN_SIZE_PX));
  svg.setAttribute("viewBox", `0 0 ${MARKER_PIN_SIZE_PX} ${MARKER_PIN_SIZE_PX}`);
  svg.setAttribute("aria-hidden", "true");

  const outerRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  outerRing.setAttribute("cx", String(MARKER_PIN_CENTER));
  outerRing.setAttribute("cy", String(MARKER_PIN_CENTER));
  outerRing.setAttribute("r", String(MARKER_OUTER_RING_R));
  outerRing.setAttribute("fill", "none");
  outerRing.setAttribute("stroke", "#dda15e");
  outerRing.setAttribute("stroke-width", String(MARKER_OUTER_RING_STROKE));

  const middleRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  middleRing.setAttribute("cx", String(MARKER_PIN_CENTER));
  middleRing.setAttribute("cy", String(MARKER_PIN_CENTER));
  middleRing.setAttribute("r", String(MIDDLE_RING_BASE_R));
  middleRing.setAttribute("fill", "rgb(231, 161, 90)");
  middleRing.setAttribute("fill-opacity", "0.30");

  const centerDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  centerDot.setAttribute("cx", String(MARKER_PIN_CENTER));
  centerDot.setAttribute("cy", String(MARKER_PIN_CENTER));
  centerDot.setAttribute("r", String(MARKER_CENTER_DOT_R));
  centerDot.setAttribute("fill", "#e6a968");

  svg.append(outerRing, middleRing, centerDot);
  pin.appendChild(svg);
  return { pin, middleRing };
}

function startMiddleRingPulse(
  middleRing: SVGCircleElement,
): gsap.core.Timeline | null {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  return gsap
    .timeline({ repeat: -1 })
    .fromTo(
      middleRing,
      {
        attr: { r: MIDDLE_RING_BASE_R * 1.0 },
        fillOpacity: 0.75,
      },
      {
        attr: { r: MIDDLE_RING_BASE_R * 1.95 },
        fillOpacity: 0,
        duration: MARKER_PULSE_DURATION * 0.7,
        ease: MARKER_PULSE_EASE,
      },
    )
    .to(middleRing, { duration: MARKER_PULSE_DURATION * 0.3 });
}

function createMarkerElement(): {
  element: HTMLDivElement;
  middleRing: SVGCircleElement;
} {
  const root = document.createElement("div");
  root.style.cssText =
    "pointer-events:none;display:flex;width:320px;max-width:90vw;min-width:220px;flex-direction:column;align-items:center;gap:0.65rem;text-align:center;";

  const logo = document.createElement("img");
  logo.src = LOGO_SRC;
  logo.alt = "";
  logo.style.cssText = "height:auto;width:4.25rem;max-width:100%;";
  root.appendChild(logo);

  const label = document.createElement("p");
  label.textContent = "Thambalagama Estate";
  label.style.cssText =
    "margin:0;font-family:var(--font-secondary);font-size:20px;font-weight:700;line-height:130%;letter-spacing:0.2px;color:#fefae0;";
  root.appendChild(label);

  const { pin, middleRing } = createMarkerPinElement();
  root.appendChild(pin);
  return { element: root, middleRing };
}

type LocationSectionProps = {
  ready?: boolean;
};

function hasMapContainerSize(container: HTMLElement) {
  return container.offsetWidth > 0 && container.offsetHeight > 0;
}

export const LocationSection = forwardRef<HTMLElement, LocationSectionProps>(
  function LocationSection({ ready = true }, ref) {
  const sectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);

  const setSectionRef = (node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  useEffect(() => {
    if (!ready) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const container = mapContainerRef.current;
    const section = sectionRef.current;

    if (!token) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "LocationSection: NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is missing.",
        );
      }
      return;
    }

    if (!container || mapRef.current) return;

    let cancelled = false;
    let map: import("mapbox-gl").Map | null = null;
    let marker: import("mapbox-gl").Marker | null = null;
    let markerPulseTween: gsap.core.Timeline | null = null;
    let sizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;

    const handleResize = () => {
      map?.resize();
    };

    const initMap = async () => {
      if (cancelled || mapRef.current || !hasMapContainerSize(container)) {
        return;
      }

      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");

      if (cancelled || mapRef.current || !hasMapContainerSize(container)) {
        return;
      }

      mapboxgl.accessToken = token;
      mapboxgl.workerUrl = MAPBOX_WORKER_URL;

      map = new mapboxgl.Map({
        container,
        style: MAP_STYLE,
        center: [ESTATE_LNG, ESTATE_LAT],
        zoom: 10.5,
        pitch: 0,
        bearing: 0,
        scrollZoom: false,
        boxZoom: false,
        dragRotate: false,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        attributionControl: false,
      });

      mapRef.current = map;

      const { element: markerElement, middleRing } = createMarkerElement();
      markerPulseTween = startMiddleRingPulse(middleRing);

      marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([ESTATE_LNG, ESTATE_LAT])
        .addTo(map);

      map.on("load", handleResize);
      map.on("error", (event: import("mapbox-gl").ErrorEvent) => {
        if (process.env.NODE_ENV === "development") {
          console.error("LocationSection map error:", event.error);
        }
      });

      window.addEventListener("resize", handleResize);
      ScrollTrigger.addEventListener("refresh", handleResize);

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
      sizeObserver = resizeObserver;

      if (section) {
        visibilityObserver = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              requestAnimationFrame(handleResize);
            }
          },
          { threshold: 0.01 },
        );
        visibilityObserver.observe(section);
      }

      requestAnimationFrame(handleResize);
    };

    if (hasMapContainerSize(container)) {
      void initMap();
    } else {
      sizeObserver = new ResizeObserver(() => {
        if (hasMapContainerSize(container)) {
          sizeObserver?.disconnect();
          sizeObserver = null;
          void initMap();
        }
      });
      sizeObserver.observe(container);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.removeEventListener("refresh", handleResize);
      sizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      markerPulseTween?.kill();
      marker?.remove();
      map?.remove();
      mapRef.current = null;
    };
  }, [ready]);

  return (
    <section
      ref={setSectionRef}
      aria-label="Location"
      className="relative -mt-[100svh] z-[31] h-screen w-full overflow-hidden bg-deep-forest"
    >
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0 h-full w-full"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end px-5 pb-5 md:px-8 md:pb-8">
        <article className="pointer-events-auto flex w-[380px] shrink-0 flex-col gap-6 bg-cream pt-[12px] px-[12px] pb-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.2)] max-md:w-full max-md:max-w-[400px]">
          <div className="space-y-2">
            <p className="font-secondary text-[14px] font-semibold uppercase leading-[150%] tracking-[0.2px] text-olive">
              Location
            </p>
            <h2 className="font-secondary text-[20px] font-bold leading-[150%] tracking-[0.2px] text-forest-green">
              On the Edge of the Wild.
            </h2>
          </div>

          <ul className="flex flex-col">
            {LOCATION_ROWS.map((row, index) => (
              <li
                key={row.place}
                className={[
                  "flex items-center justify-between gap-4 py-4 font-secondary text-[14px] font-semibold leading-[150%] tracking-[0.2px]",
                  "border-dashed border-forest-green/30",
                  index === 0 ? "border-t" : "",
                  index < LOCATION_ROWS.length - 1 ? "border-b" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="text-forest-green">{row.place}</span>
                <span className="shrink-0 text-[#149B0F]">{row.distance}</span>
              </li>
            ))}
          </ul>

          <Link
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center justify-center gap-2 self-end rounded-full bg-forest-green px-[18px] py-[12px] font-secondary text-sm font-medium uppercase tracking-[0.2px] text-cream shadow-[0_4px_10px_0] shadow-black/8 transition-opacity hover:opacity-90"
          >
            Get Directions
            <ExternalLinkIcon />
          </Link>
        </article>
      </div>
    </section>
  );
},
);

LocationSection.displayName = "LocationSection";
