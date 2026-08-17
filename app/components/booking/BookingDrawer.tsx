"use client";

import gsap from "gsap";
import { useLenis } from "lenis/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  createBookingAction,
  getUnavailableDatesAction,
} from "@/app/actions/bookings";
import { Button } from "../Button";
import { useBooking } from "./BookingProvider";
import { DateRangeCalendar, type DateRange } from "./DateRangeCalendar";
import { GuestStepper } from "./GuestStepper";

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MAX_GUESTS = 18;

const COUNTRY_CODES = [
  { code: "+94", flag: "🇱🇰", label: "Sri Lanka" },
  { code: "+1", flag: "🇺🇸", label: "United States" },
  { code: "+44", flag: "🇬🇧", label: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+65", flag: "🇸🇬", label: "Singapore" },
] as const;

const PURPOSE_OPTIONS = [
  { value: "", label: "(WELLNESS, CORPORATE)" },
  { value: "wellness", label: "Wellness" },
  { value: "corporate", label: "Corporate" },
  { value: "celebration", label: "Celebration" },
  { value: "other", label: "Other" },
] as const;

function formatShortDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SectionRow({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-forest-green/15 py-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] md:gap-10">
      <h3 className="font-secondary text-[24px] font-semibold leading-tight text-deep-forest">
        {title}
      </h3>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block font-secondary text-[16px] font-bold uppercase text-deep-forest">
      {children}
    </span>
  );
}

function DropdownArrow() {
  return (
    <span
      aria-hidden
      className="h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-current"
    />
  );
}

const inputClass =
  "w-full border border-forest-green/25 bg-cream px-3 py-3 font-secondary text-[12px] font-medium uppercase tracking-[0.12em] text-deep-forest outline-none placeholder:text-[#7C7F78] focus:border-forest-green/50";

const dropdownButtonClass =
  "flex w-full items-center justify-between border border-forest-green/25 bg-cream px-3 py-3 font-secondary text-[12px] font-semibold uppercase tracking-[0.12em] outline-none transition-colors hover:border-forest-green/50 focus:border-forest-green/50";

const dropdownMenuClass =
  "absolute top-full left-0 z-30 mt-1 w-full overflow-hidden border border-forest-green/25 bg-cream shadow-[0_10px_24px_rgba(24,32,14,0.12)]";

const dropdownOptionClass =
  "flex w-full items-center gap-2 px-3 py-2.5 text-left font-secondary text-[12px] font-semibold uppercase tracking-[0.12em] text-deep-forest transition-colors hover:bg-deep-forest hover:text-cream focus:bg-deep-forest focus:text-cream focus:outline-none";

const overlayHidden = {
  opacity: 0,
  backdropFilter: "blur(0px)",
  WebkitBackdropFilter: "blur(0px)",
};

const overlayVisible = {
  opacity: 0.4,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

function ThankYouView({
  titleId,
  onDismiss,
}: {
  titleId: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-6 border-b border-forest-green/15 px-6 pt-8 pb-8 md:px-10 md:pt-10">
        <div className="min-w-0">
          <h2
            id={titleId}
            className="font-secondary text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] text-forest-green"
          >
            Thank you for your request!
          </h2>
          <p className="mt-2 max-w-md font-secondary text-[13px] leading-relaxed text-forest-green/60 md:text-sm">
            Your details have been successfully submitted.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close booking form"
          onClick={onDismiss}
          className="flex h-9 w-9 shrink-0 items-center justify-center bg-forest-green text-cream transition-opacity hover:opacity-80"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center md:px-10">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden
          className="text-olive"
        >
          <path
            d="M8 21.5L16 29.5L32 11.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-6 font-secondary text-[24px] font-semibold text-forest-green">
          Request Received.
        </p>
        <p className="mt-4 max-w-md font-secondary text-[16px] font-bold leading-relaxed text-sage-muted">
          Our manager will personally review your request &amp; reach out to
          you via WhatsApp within{" "}
          <span className="text-forest-green">24 hours</span> to
          arrange your exclusive escape.
        </p>
        <p className="mt-5 font-secondary text-[16px] font-bold text-sage-muted">
          We look forward to welcoming you.
        </p>
      </div>

      <div className="flex shrink-0 justify-end border-t border-forest-green/15 bg-cream px-6 py-4 md:px-10">
        <Button type="button" variant="dark" size="medium" onClick={onDismiss}>
          Continue Exploring
        </Button>
      </div>
    </div>
  );
}

export function BookingDrawer() {
  const { isOpen, close } = useBooking();
  const lenis = useLenis();
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [mounted, setMounted] = useState(false);
  const [unavailableDateKeys, setUnavailableDateKeys] = useState<string[]>([]);

  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [whatsapp, setWhatsapp] = useState("");
  const [purpose, setPurpose] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [openDropdown, setOpenDropdown] = useState<
    "country" | "purpose" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    void getUnavailableDatesAction().then((result) => {
      if (cancelled || !result.ok) return;
      setUnavailableDateKeys(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const unavailableDates = useMemo(
    () =>
      unavailableDateKeys.map((key) => {
        const [y, m, d] = key.split("-").map(Number);
        return new Date(y, (m ?? 1) - 1, d ?? 1);
      }),
    [unavailableDateKeys],
  );

  const guestTotal = adults + childrenCount;
  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];
  const selectedPurpose =
    PURPOSE_OPTIONS.find((opt) => opt.value === purpose) ?? PURPOSE_OPTIONS[0];

  const canSubmit =
    Boolean(range.from && range.to) &&
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    whatsapp.length === 9 &&
    guestTotal > 0 &&
    guestTotal <= MAX_GUESTS;

  const statusText =
    range.from && range.to
      ? `${formatShortDate(range.from)} – ${formatShortDate(range.to)}`
      : range.from
        ? `${formatShortDate(range.from)} – select checkout`
        : "Select your dates to begin.";

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    tlRef.current?.kill();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (isOpen) {
      if (reduceMotion) {
        gsap.set(overlay, overlayVisible);
        gsap.set(panel, { xPercent: 0 });
        closeBtnRef.current?.focus();
        return;
      }

      gsap.set(overlay, overlayHidden);
      gsap.set(panel, { xPercent: 100 });

      const tl = gsap.timeline({
        onComplete: () => closeBtnRef.current?.focus(),
      });
      tlRef.current = tl;
      // Soft parallel open: overlay eases in a touch longer than the panel
      tl.to(
        overlay,
        { ...overlayVisible, duration: 0.85, ease: "power2.out" },
        0,
      );
      tl.to(
        panel,
        { xPercent: 0, duration: 0.75, ease: "power3.out" },
        0.04,
      );

      return () => {
        tl.kill();
      };
    }

    if (reduceMotion) {
      gsap.set(overlay, overlayHidden);
      gsap.set(panel, { xPercent: 100 });
      setMounted(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => setMounted(false),
    });
    tlRef.current = tl;
    tl.to(
      panel,
      { xPercent: 100, duration: 0.55, ease: "power2.in" },
      0,
    );
    tl.to(
      overlay,
      { ...overlayHidden, duration: 0.65, ease: "power2.inOut" },
      0.05,
    );

    return () => {
      tl.kill();
    };
  }, [isOpen, mounted]);

  // Scroll lock + Lenis
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [isOpen, lenis]);

  const resetForm = () => {
    setRange({ from: null, to: null });
    setAdults(2);
    setChildrenCount(0);
    setFullName("");
    setEmail("");
    setCountryCode("+94");
    setWhatsapp("");
    setPurpose("");
    setSpecialRequests("");
    setOpenDropdown(null);
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  };

  const dismiss = () => {
    resetForm();
    close();
  };

  // Escape key
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resetForm();
        close();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const setAdultsClamped = (next: number) => {
    const max = MAX_GUESTS - childrenCount;
    setAdults(Math.max(1, Math.min(max, next)));
  };

  const setChildrenClamped = (next: number) => {
    const max = MAX_GUESTS - adults;
    setChildrenCount(Math.max(0, Math.min(max, next)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !range.from || !range.to || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createBookingAction({
      checkIn: toISODate(range.from),
      checkOut: toISODate(range.to),
      adults,
      children: childrenCount,
      fullName: fullName.trim(),
      email: email.trim(),
      whatsapp: `${countryCode}${whatsapp.trim()}`,
      purpose,
      specialRequests: specialRequests.trim(),
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setSubmitSuccess(true);
  };

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[600]"
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black"
        onClick={dismiss}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent
        className="absolute inset-y-0 right-0 flex w-full will-change-transform flex-col bg-cream shadow-[-8px_0_40px_rgba(0,0,0,0.12)] md:w-[87.5%]"
      >
        {submitSuccess ? (
          <ThankYouView titleId={titleId} onDismiss={dismiss} />
        ) : (
          <>
            <button
              ref={closeBtnRef}
              type="button"
              aria-label="Close booking form"
              onClick={dismiss}
              className="absolute top-8 right-6 z-20 flex h-9 w-9 shrink-0 items-center justify-center bg-forest-green text-cream transition-opacity hover:opacity-80 md:top-10 md:right-10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-8 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:px-10 md:pt-10">
                <div className="min-w-0 pr-12 pb-2">
                  <h2
                    id={titleId}
                    className="font-secondary text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] text-forest-green"
                  >
                    Request Your Stay
                  </h2>
                  <p className="mt-2 max-w-md font-secondary text-[13px] leading-relaxed text-forest-green/60 md:text-sm">
                    Share your dates and we&apos;ll follow up within 24 hours to
                    confirm your stay.
                  </p>
                </div>

                <SectionRow title="Plan your stay.">
                  <div>
                    <FieldLabel>Dates</FieldLabel>
                    <div className="bg-cream/80">
                      <DateRangeCalendar
                        value={range}
                        onChange={setRange}
                        unavailableDates={unavailableDates}
                      />
                    </div>
                  </div>
                </SectionRow>

                <SectionRow title="Who is joining you?">
                  <div>
                    <FieldLabel>Guest Count</FieldLabel>
                    <p className="mb-4 font-secondary text-[16px] font-semibold text-[#7C7F78]">
                      Estate Capacity: Up to {MAX_GUESTS} Guests
                    </p>
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
                      <GuestStepper
                        label="Adults"
                        value={adults}
                        min={1}
                        max={MAX_GUESTS - childrenCount}
                        onChange={setAdultsClamped}
                      />
                      <GuestStepper
                        label="Children"
                        value={childrenCount}
                        min={0}
                        max={MAX_GUESTS - adults}
                        onChange={setChildrenClamped}
                      />
                    </div>
                  </div>
                </SectionRow>

                <SectionRow title="How can we reach you?">
                  <div>
                    <FieldLabel>Contact Details</FieldLabel>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        name="fullName"
                        required
                        autoComplete="name"
                        placeholder="FULL NAME*"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder="EMAIL ADDRESS*"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                      />
                      <div className="flex border border-forest-green/25 bg-cream">
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            aria-label="Country code"
                            aria-expanded={openDropdown === "country"}
                            onClick={() =>
                              setOpenDropdown((current) =>
                                current === "country" ? null : "country",
                              )
                            }
                            className="flex h-full items-center gap-3 px-6 py-3 text-deep-forest outline-none transition-colors hover:bg-deep-forest hover:text-cream focus:bg-deep-forest focus:text-cream"
                          >
                            <span aria-hidden className="text-base leading-none">
                              {selectedCountry.flag}
                            </span>
                            <DropdownArrow />
                          </button>
                          {openDropdown === "country" ? (
                            <div className={`${dropdownMenuClass} min-w-[150px]`}>
                              {COUNTRY_CODES.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setCountryCode(c.code);
                                    setOpenDropdown(null);
                                  }}
                                  className={dropdownOptionClass}
                                >
                                  <span aria-hidden>{c.flag}</span>
                                  <span>{c.code}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <span
                          className="my-3 w-px shrink-0 bg-forest-green/25"
                          aria-hidden
                        />
                        <input
                          type="tel"
                          name="whatsapp"
                          required
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="WHATSAPP NUMBER*"
                          value={whatsapp}
                          maxLength={9}
                          onChange={(e) =>
                            setWhatsapp(
                              e.target.value.replace(/\D/g, "").slice(0, 9),
                            )
                          }
                          className="min-w-0 flex-1 bg-cream px-3 py-3 font-secondary text-[12px] font-semibold uppercase tracking-[0.12em] text-deep-forest outline-none placeholder:text-[#7C7F78] focus:border-forest-green/50"
                        />
                      </div>
                    </div>
                  </div>
                </SectionRow>

                <SectionRow title="Personalize your stay.">
                  <div className="flex flex-col gap-5">
                    <div>
                      <FieldLabel>Purpose of Stay</FieldLabel>
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="Purpose of Stay"
                          aria-expanded={openDropdown === "purpose"}
                          onClick={() =>
                            setOpenDropdown((current) =>
                              current === "purpose" ? null : "purpose",
                            )
                          }
                          className={`${dropdownButtonClass} ${purpose ? "text-deep-forest" : "text-[#7C7F78]"}`}
                        >
                          <span>{selectedPurpose.label}</span>
                          <DropdownArrow />
                        </button>
                        {openDropdown === "purpose" ? (
                          <div className={dropdownMenuClass}>
                            {PURPOSE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value || "placeholder"}
                                type="button"
                                onClick={() => {
                                  setPurpose(opt.value);
                                  setOpenDropdown(null);
                                }}
                                className={dropdownOptionClass}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Special Requests</FieldLabel>
                      <textarea
                        name="specialRequests"
                        rows={4}
                        placeholder="Anything we should know? Private chef, celebrations, accessibility needs..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className={`${inputClass} resize-y normal-case tracking-normal`}
                      />
                    </div>
                  </div>
                </SectionRow>
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-forest-green/15 bg-cream px-6 py-4 md:px-10">
                {submitError ? (
                  <p
                    className="font-secondary text-[12px] text-chestnut"
                    role="alert"
                  >
                    {submitError}
                  </p>
                ) : (
                  <p className="font-secondary text-[12px] text-forest-green/55">
                    {statusText}
                  </p>
                )}
                <div className="flex sm:justify-end">
                  <Button
                    type="submit"
                    variant="dark"
                    size="medium"
                    disabled={!canSubmit || isSubmitting}
                    showArrow={!isSubmitting}
                  >
                    {isSubmitting ? "Sending…" : "Request to Book"}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}
