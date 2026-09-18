import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Barlow_Condensed({
  weight: ["600", "800"],
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

const plex = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Billie — porch goose at 905 Bridge",
  description:
    "Plastic porch goose at 905 Bridge. Chip in and the winning outfit gets ordered and put on her.",
  metadataBase: new URL("https://chxgoose.com"),
  openGraph: {
    title: "Billie the porch goose",
    description: "905 Bridge. Vote with dollars. We order the outfit.",
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
