import { PORCH_FAQ } from "@/lib/seo";

export function FaqList() {
  return (
    <section className="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Porch questions</h2>
      {PORCH_FAQ.map((item) => (
        <div key={item.question}>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
    </section>
  );
}
