import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "That page isn’t on the porch — chxgoose",
  description: "Nothing lives at this address. Billie is on the porch at chxgoose.com.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="porch legal-page">
      <p className="eyebrow">905 Bridge · porch goose</p>
      <h1>That page isn’t on the porch</h1>
      <p>Nothing lives at this address.</p>
      <p>
        <Link href="/">Back to Billie</Link>
      </p>
    </main>
  );
}
