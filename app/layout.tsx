import type { Metadata } from "next";
import { Alfa_Slab_One, IBM_Plex_Mono, Nunito } from "next/font/google";
import "./globals.css";

const display = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
});

const plex = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "You found Billie! — chxgoose",
  description:
    "You found Billie the porch goose at 905 Bridge. Joke of the day, then chip in — the winning Amazon outfit gets put on her.",
  metadataBase: new URL("https://chxgoose.com"),
  openGraph: {
    title: "You found Billie!",
    description: "Porch goose at 905 Bridge. Honk to dress her.",
    url: "https://chxgoose.com",
    images: [{ url: "/billie.jpg" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${plex.variable}`}>
        {children}
      </body>
    </html>
  );
}
