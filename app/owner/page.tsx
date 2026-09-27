import type { Metadata } from "next";
import Link from "next/link";
import { OwnerDesk } from "@/components/OwnerDesk";

export const metadata: Metadata = {
  title: "Billie’s desk — chxgoose",
  robots: { index: false, follow: false },
};

export default function OwnerPage() {
  return (
    <main className="porch">
      <p className="eyebrow">905 Bridge · porch goose</p>
      <h1>Billie’s desk</h1>
      <p className="sub">Change what’s on her, the caption, and whether a look has been ordered.</p>
      <OwnerDesk />
      <p className="legal">
        <Link href="/">Back to the porch</Link>
      </p>
    </main>
  );
}
