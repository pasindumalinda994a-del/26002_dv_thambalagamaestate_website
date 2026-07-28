import type { ReactNode } from "react";

type ContentBoxProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function ContentBox({ id, title, children }: ContentBoxProps) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-6">
      <h2 className="font-space-grotesk text-2xl font-bold uppercase leading-[130%] tracking-[0.18px] text-forest-green md:text-[36px]">
        {title}
      </h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
