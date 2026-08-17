import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { AmbientAudioProvider } from "./components/AmbientAudioToggle";
import { BookingProvider } from "./components/booking/BookingProvider";
import { LazyBookingDrawer } from "./components/booking/LazyBookingDrawer";
import { JsonLd } from "./components/JsonLd";
import { PageTransitionProvider } from "./components/PageTransitionProvider";
import { SitePreloader } from "./components/SitePreloader";
import { SmoothScroll } from "./components/SmoothScroll";
import {
  DEFAULT_OG_IMAGE,
  FAVICON_LOGO_PATH,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  buildSiteJsonLd,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "700"],
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
  icons: {
    icon: [{ url: FAVICON_LOGO_PATH, type: "image/png" }],
    apple: [{ url: FAVICON_LOGO_PATH, type: "image/png" }],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-LK" className={`h-full antialiased ${spaceGrotesk.variable}`}>
      <body className="min-h-full flex flex-col font-primary">
        <JsonLd data={buildSiteJsonLd()} />
        <AmbientAudioProvider>
          <BookingProvider>
            <SitePreloader>
              <SmoothScroll>
                <PageTransitionProvider>
                  {children}
                  <LazyBookingDrawer />
                </PageTransitionProvider>
              </SmoothScroll>
            </SitePreloader>
          </BookingProvider>
        </AmbientAudioProvider>
      </body>
    </html>
  );
}
