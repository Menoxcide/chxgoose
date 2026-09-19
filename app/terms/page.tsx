import Link from "next/link";
import type { Metadata } from "next";
import { INFO_EMAIL } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Honks, gifts, and no refunds — chxgoose",
  description: "Honks are voluntary gifts toward Billie’s outfit. Not tax-deductible. No refunds.",
};

export default function TermsPage() {
  return (
    <main className="porch legal-page">
      <p className="eyebrow">905 Bridge · porch goose</p>
      <h1>Honks, gifts, and no refunds</h1>
      <p>
        A honk is a voluntary contribution toward buying a porch-goose outfit from Amazon and putting it
        on Billie at 905 Bridge. You are not buying the outfit for yourself, and you are not buying a
        service.
      </p>
      <p>
        chxgoose.com is not a charity or a 501(c)(3). Honks are not tax-deductible. Do not treat a honk
        as a charitable donation.
      </p>
      <p>
        All honks are final. No refunds, returns, or exchanges — including a change of mind, a different
        outfit winning, Amazon being out of stock, a price change, or Billie wearing something else.
      </p>
      <p>
        If a bank or card network reverses a payment, that honk does not count as a vote.
      </p>
      <p>
        The highest pot is what the owner aims to order when they’re ready. Amazon listings, sizes, and
        stock can change.
      </p>
      <p>
        Questions:{" "}
        <a href={`mailto:${INFO_EMAIL}`}>{INFO_EMAIL}</a>
      </p>
      <p>
        <Link href="/">Back to Billie</Link>
      </p>
    </main>
  );
}
