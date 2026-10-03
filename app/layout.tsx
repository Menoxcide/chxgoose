import type { Metadata } from "next";
import { Alfa_Slab_One, IBM_Plex_Mono, Nunito } from "next/font/google";
import { VisitPing } from "@/components/VisitPing";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const display = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "You found Billie!",
    description: HOME_DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/billie.jpg",
        alt: "Billie the porch goose on the porch at 905 Bridge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You found Billie!",
    description: HOME_DESCRIPTION,
    images: ["/billie.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${plex.variable}`}>
        {children}
        <VisitPing />
      </body>
    </html>
  );
}
