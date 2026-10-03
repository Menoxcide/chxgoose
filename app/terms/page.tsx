import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { INFO_EMAIL } from "@/lib/copy";
import { TERMS_CRUMBS, TERMS_DESCRIPTION, TERMS_TITLE, termsJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: TERMS_TITLE,
  description: TERMS_DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Honks, gifts, and no refunds",
    description: TERMS_DESCRIPTION,
    url: "/terms",
  },
  twitter: {
    title: "Honks, gifts, and no refunds",
    description: TERMS_DESCRIPTION,
  },
};

export default function TermsPage() {
  return (
    <main className="porch legal-page">
      <Breadcrumbs crumbs={TERMS_CRUMBS} />
      <p className="eyebrow">905 Bridge · porch goose</p>
      <h1>Honks, gifts, and no refunds</h1>
      <FaqList />
      <p>
        Questions: <a href={`mailto:${INFO_EMAIL}`}>{INFO_EMAIL}</a>
      </p>
      <p>
        <Link href="/">Back to Billie</Link>
      </p>
      <JsonLd data={termsJsonLd()} />
    </main>
  );
}
