"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { forwardRef, useEffect, useState, useRef } from "react";
import { Button } from "../components/Button";
import { H2 } from "../components/H2";

const LOGO_SRC = "/Logo/ThambalagamaLogo.png";
const LOGO_TAN = "#dda15e"; // --color-tan
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";
const MAP_STATIC_SRC = "/homepageimages/location-map.webp";
const ESTATE_LNG = 80.403;
const ESTATE_LAT = 6.383;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${ESTATE_LAT},${ESTATE_LNG}`;
const MAPBOX_WORKER_URL = "/mapbox-gl-csp-worker.js";
const MOBILE_MQ = "(max-width: 767px)";
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

  const outerRing = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  outerRing.setAttribute("cx", String(MARKER_PIN_CENTER));
  outerRing.setAttribute("cy", String(MARKER_PIN_CENTER));
  outerRing.setAttribute("r", String(MARKER_OUTER_RING_R));
  outerRing.setAttribute("fill", "none");
  outerRing.setAttribute("stroke", "#dda15e");
  outerRing.setAttribute("stroke-width", String(MARKER_OUTER_RING_STROKE));

  const middleRing = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  middleRing.setAttribute("cx", String(MARKER_PIN_CENTER));
  middleRing.setAttribute("cy", String(MARKER_PIN_CENTER));
  middleRing.setAttribute("r", String(MIDDLE_RING_BASE_R));
  middleRing.setAttribute("fill", "rgb(231, 161, 90)");
  middleRing.setAttribute("fill-opacity", "0.30");

  const centerDot = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
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

  const logo = document.createElement("div");
  logo.setAttribute("role", "img");
  logo.setAttribute("aria-label", "Thambalagama Estate");
  logo.style.cssText = [
    "width:4.25rem",
    "max-width:100%",
    "aspect-ratio:361/381",
    `background-color:${LOGO_TAN}`,
    `-webkit-mask-image:url(${LOGO_SRC})`,
    `mask-image:url(${LOGO_SRC})`,
    "-webkit-mask-size:contain",
    "mask-size:contain",
    "-webkit-mask-repeat:no-repeat",
    "mask-repeat:no-repeat",
    "-webkit-mask-position:center",
    "mask-position:center",
    "-webkit-mask-source-type:luminance",
    "mask-mode:luminance",
  ].join(";");
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

function StaticMapMarker() {
  const middleRingRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const middleRing = middleRingRef.current;
    if (!middleRing) return;

    const pulse = startMiddleRingPulse(middleRing);
    return () => {
      pulse?.kill();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] flex items-start justify-center pt-[18vh]"
    >
      <div className="flex w-[min(320px,90vw)] flex-col items-center gap-[0.65rem] text-center">
        <div
          role="img"
          aria-label="Thambalagama Estate"
          className="aspect-[361/381] w-[4.25rem] max-w-full"
          style={{
            backgroundColor: LOGO_TAN,
            WebkitMaskImage: `url(${LOGO_SRC})`,
            maskImage: `url(${LOGO_SRC})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
        <p className="m-0 font-secondary text-[20px] font-bold leading-[130%] tracking-[0.2px] text-cream">
          Thambalagama Estate
        </p>
        <div className="relative mt-[0.35rem] flex h-[3.75rem] w-[3.75rem] items-center justify-center">
          <svg
            width={MARKER_PIN_SIZE_PX}
            height={MARKER_PIN_SIZE_PX}
            viewBox={`0 0 ${MARKER_PIN_SIZE_PX} ${MARKER_PIN_SIZE_PX}`}
            aria-hidden
          >
            <circle
              cx={MARKER_PIN_CENTER}
              cy={MARKER_PIN_CENTER}
              r={MARKER_OUTER_RING_R}
              fill="none"
              stroke="#dda15e"
              strokeWidth={MARKER_OUTER_RING_STROKE}
            />
            <circle
              ref={middleRingRef}
              cx={MARKER_PIN_CENTER}
              cy={MARKER_PIN_CENTER}
              r={MIDDLE_RING_BASE_R}
              fill="rgb(231, 161, 90)"
              fillOpacity={0.3}
            />
            <circle
              cx={MARKER_PIN_CENTER}
              cy={MARKER_PIN_CENTER}
              r={MARKER_CENTER_DOT_R}
              fill="#e6a968"
            />
          </svg>
        </div>
      </div>
    </div>
  );
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
    // Default true so mobile never boots Mapbox before the media query resolves.
    const [isMobile, setIsMobile] = useState(true);

    const setSectionRef = (node: HTMLElement | null) => {
      sectionRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    useEffect(() => {
      const mq = window.matchMedia(MOBILE_MQ);
      const sync = () => setIsMobile(mq.matches);
      sync();
      mq.addEventListener("change", sync);
      return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
      if (!ready || isMobile) return;

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
      let lastWidth = 0;
      let lastHeight = 0;

      const handleResize = () => {
        if (!map || !container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width;
        lastHeight = height;
        map.resize();
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
    }, [ready, isMobile]);

    return (
      <section
        ref={setSectionRef}
        aria-label="Location"
        data-ambient-zone="locationCta"
        className="relative -mt-[100vh] z-[31] h-screen w-full overflow-hidden bg-deep-forest"
      >
        {isMobile ? (
          <div className="absolute inset-0 z-0 h-full w-full" aria-hidden>
            <Image
              src={MAP_STATIC_SRC}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[center_22%]"
            />
            <StaticMapMarker />
          </div>
        ) : (
          <div
            ref={mapContainerRef}
            className="absolute inset-0 z-0 h-full w-full"
            aria-hidden
          />
        )}

        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end px-5 pb-5 md:px-8 md:pb-8">
          <article className="pointer-events-auto flex w-[380px] shrink-0 flex-col gap-6 bg-cream pt-[12px] px-[12px] pb-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.2)] max-md:w-full max-md:max-w-[400px]">
            <div className="space-y-2">
              <p className="font-secondary text-[14px] font-semibold uppercase leading-[150%] tracking-[0.2px] text-olive">
                Location
              </p>
              <H2
                ready={ready}
                triggerRef={sectionRef}
                className="text-[20px]! leading-[150%] tracking-[0.2px] text-forest-green"
              >
                On the Edge of the Wild.
              </H2>
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

            <Button
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="dark"
              className="w-fit self-end"
            >
              Get Directions
            </Button>
          </article>
        </div>
      </section>
    );
  },
);

LocationSection.displayName = "LocationSection";
