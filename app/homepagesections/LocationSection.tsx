"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import mapboxgl from "mapbox-gl";
import Image from "next/image";
import Link from "next/link";
import { forwardRef, useEffect, useRef } from "react";
import { H2 } from "../components/H2";
import { Paragraph } from "../components/Paragraph";

const LOGO_SRC = "/Logo/Thambalagama%20Logo%202.png";
const CARD_IMAGE_SRC = "/main%20images/Villa%20Image%201.webp";
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

const LOCATION_DETAILS = [
  "The Border: Inside the buffer zone.",
  "The Gate: 7 km to Lankagama gate.",
] as const;

function PointingHandIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="mt-0.5 shrink-0 text-cream/80"
    >
      <path
        d="M7 11V7.5C7 6.11929 8.11929 5 9.5 5C10.3284 5 11 5.67157 11 6.5V11M11 11V6.5C11 5.11929 12.1193 4 13.5 4C14.3284 4 15 4.67157 15 5.5V11M15 11V7C15 5.89543 15.8954 5 17 5C18.1046 5 19 5.89543 19 7V13.5C19 17.0899 16.0899 20 12.5 20H10.5C7.46243 20 5 17.5376 5 14.5V12.5C5 11.6716 5.67157 11 6.5 11H7"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
    "pointer-events:none;display:flex;width:clamp(220px,22vw,320px);flex-direction:column;align-items:center;gap:0.65rem;text-align:center;";

  const logo = document.createElement("img");
  logo.src = LOGO_SRC;
  logo.alt = "";
  logo.style.cssText = "height:auto;width:clamp(3.25rem,5vw,4.25rem);";
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
  const mapRef = useRef<mapboxgl.Map | null>(null);

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
    let map: mapboxgl.Map | null = null;
    let marker: mapboxgl.Marker | null = null;
    let markerPulseTween: gsap.core.Timeline | null = null;
    let sizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;

    const handleResize = () => {
      map?.resize();
    };

    const initMap = () => {
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
      map.on("error", (event) => {
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
      initMap();
    } else {
      sizeObserver = new ResizeObserver(() => {
        if (hasMapContainerSize(container)) {
          sizeObserver?.disconnect();
          sizeObserver = null;
          initMap();
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

      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-start px-[clamp(1.25rem,4vw,2rem)] pb-[clamp(1.25rem,4vw,2rem)] pt-[clamp(5rem,12vw,7rem)] md:pt-0">
        <article className="pointer-events-auto flex h-[571px] w-[461px] shrink-0 flex-col overflow-hidden rounded-[8px] bg-deep-forest/55 shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-cream/10 backdrop-blur-xl max-md:h-auto max-md:w-full max-md:max-w-[clamp(300px,90vw,400px)]">
          <div className="relative min-h-0 w-full flex-1 overflow-hidden max-md:aspect-4/3 max-md:flex-none">
            <Image
              src={CARD_IMAGE_SRC}
              alt="Thambalagama Estate building"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 26vw"
            />
          </div>

          <div className="flex shrink-0 flex-col space-y-5 px-[clamp(1.25rem,2.5vw,1.75rem)] py-[clamp(1.25rem,2.5vw,1.75rem)]">
            <div className="space-y-2">
              <H2
                ready={ready}
                triggerRef={sectionRef}
                triggerStart="center 82%"
                className="text-cream"
              >
                THE LOCATION
              </H2>
              <Paragraph className="text-[clamp(15px,1vw+12px,18px)] text-cream/90">
                Where the Map Ends.
              </Paragraph>
            </div>

            <ul className="space-y-3">
              {LOCATION_DETAILS.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-3 font-secondary text-[clamp(14px,0.8vw+12px,16px)] leading-[140%] tracking-[0.3px] text-cream/85"
                >
                  <PointingHandIcon />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            <Link
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center justify-center gap-2 self-start rounded-full bg-cream px-[18px] py-[12px] font-secondary text-sm font-medium uppercase tracking-[0.2px] text-forest-green shadow-[0_4px_10px_0] shadow-black/8 transition-opacity hover:opacity-90"
            >
              Get Directions
              <ExternalLinkIcon />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
},
);

LocationSection.displayName = "LocationSection";
