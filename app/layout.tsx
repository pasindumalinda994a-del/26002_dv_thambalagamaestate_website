import type { Metadata, Viewport } from "next";
import { Roboto, Space_Grotesk } from "next/font/google";
import { BookingDrawer } from "./components/booking/BookingDrawer";
import { BookingProvider } from "./components/booking/BookingProvider";
import { JsonLd } from "./components/JsonLd";
import { PageTransitionProvider } from "./components/PageTransitionProvider";
import { SmoothScroll } from "./components/SmoothScroll";
import { listConfirmedUnavailableDates } from "@/lib/bookings/repository";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  buildSiteJsonLd,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

const roboto = Roboto({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-face",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk-face",
});

export const viewport: Viewport = {
  themeColor: "#283618",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} | Sinharaja Rainforest Stay in Sri Lanka`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: absoluteUrl("/"),
    title: `${SITE_NAME} | Sinharaja Rainforest Stay in Sri Lanka`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: `${SITE_NAME} — Sinharaja Forest Sri Lanka`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Sinharaja Rainforest Stay in Sri Lanka`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let unavailableDateKeys: string[] = [];
  try {
    unavailableDateKeys = await listConfirmedUnavailableDates();
  } catch (error) {
    console.error("Failed to load confirmed unavailable dates", error);
  }

  return (
    <html lang="en-LK" className={`h-full antialiased ${roboto.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-full flex flex-col font-primary">
        <JsonLd data={buildSiteJsonLd()} />
        <SmoothScroll>
          <BookingProvider>
            <PageTransitionProvider>
              {children}
              <BookingDrawer unavailableDateKeys={unavailableDateKeys} />
            </PageTransitionProvider>
          </BookingProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
