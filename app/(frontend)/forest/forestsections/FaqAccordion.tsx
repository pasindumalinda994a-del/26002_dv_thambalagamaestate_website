"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className="border-b border-[#CFCBB1] py-8"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-4 text-left"
              onClick={() =>
                setOpenIndex((current) => (current === index ? null : index))
              }
            >
              <div className="flex flex-col gap-2">
                <span className="font-space-grotesk text-base font-bold uppercase leading-[150%] tracking-[0.2px] text-deep-forest">
                  {item.question}
                </span>
                <div
                  className={[
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <p className="pt-1 font-secondary text-base font-normal leading-[150%] tracking-[0.2px] text-forest-green">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
              <span className="mt-0.5 shrink-0 text-forest-green" aria-hidden>
                {isOpen ? <MinusIcon /> : <PlusIcon />}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
