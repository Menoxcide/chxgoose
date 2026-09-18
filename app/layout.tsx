import type { Metadata } from "next";
import { IBM_Plex_Mono, Nunito, Titan_One } from "next/font/google";
import "./globals.css";

const titan = Titan_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
});

const plex = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "You found Billy — chxgoose",
  description: "Silly Billy, porch goose at 905 Bridge. Honk to dress him tomorrow.",
  metadataBase: new URL("https://chxgoose.com"),
  openGraph: {
    title: "You found Billy",
    description: "Porch goose. Dollar votes. Daily jokes. Honk.",
    url: "https://chxgoose.com",
    images: [{ url: "/billy/bowtie.jpg" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${titan.variable} ${nunito.variable} ${plex.variable}`}>
        {children}
      </body>
    </html>
  );
}
