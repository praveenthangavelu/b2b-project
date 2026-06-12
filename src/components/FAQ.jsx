import { useState } from "react";

/**
 * Prospecto — FAQ
 * Accordion section matching the Prospecto brand + LoginPage style.
 * Self-contained: inline styles + injected fonts/keyframes. No deps.
 * Drop into a Vite + React app. Edit the `faqs` array to change content.
 */

const BRAND = "#3953fb";
const INK = "#0d1330";
const MUTE = "#6b7280";

const faqs = [
  {
    q: "What is Prospecto?",
    a: "Prospecto is a B2B contact intelligence tool. Give it a name, company, email, or LinkedIn URL and it finds and verifies the missing details — work email, phone number, and full LinkedIn profile — so you can reach the right people faster.",
  },
  {
    q: "How do credits work?",
    a: "Every lookup costs credits — for example, a LinkedIn enrichment is 5 credits and a verified email is 1. You only pay for successful results: cache hits and failed lookups are never charged. Your balance updates live as you work.",
  },
  {
    q: "What's the difference between Email Finder and Email Validation?",
    a: "Email Finder discovers a person's email from their name and company. Email Validation takes a list of emails you already have and checks whether each one is valid, risky, or undeliverable — ideal for cleaning a list before a campaign.",
  },
  {
    q: "Can I enrich from a LinkedIn URL?",
    a: "Yes. Paste either a personal profile URL (linkedin.com/in/...) or a company URL (linkedin.com/company/...) and Prospecto returns the full profile — name, title, company, location, email, and phone where available.",
  },
  {
    q: "Do I get charged for failed lookups?",
    a: "No. If a lookup returns no result, or if the result comes from cache, you are not charged. Credits are only deducted on a successful, billable lookup — so your balance is never wasted.",
  },
  {
    q: "Can I process a whole list at once?",
    a: "Yes. Every tool has a Bulk mode — upload or paste a CSV and Prospecto processes each row with a live progress bar and per-row status, then lets you export the enriched or validated results as a CSV.",
  },
  {
    q: "Is my data secure?",
    a: "Your account is protected with encrypted passwords and token-based sessions, and all enrichment requests are proxied through our backend so provider keys are never exposed. Your lookup history stays private to your account.",
  },
];

const ChevronIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={open ? BRAND : INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform .4s cubic-bezier(.22,1,.36,1)", transform: open ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }}
    aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .pr-faq-item { transition: border-color .2s, box-shadow .25s, background .2s; }
        .pr-faq-item:hover { border-color: #c9d2f5; }
        .pr-faq-q { transition: color .2s; }
      `}</style>

      <section style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#f4f6fc",
        padding: "72px 24px",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* header */}
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{
              fontSize: 12, letterSpacing: ".16em", fontWeight: 700, color: BRAND,
              background: "rgba(57,83,251,.1)", padding: "6px 14px", borderRadius: 30,
            }}>
              FAQ
            </span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700,
              fontSize: 36, color: INK, margin: "18px 0 10px", lineHeight: 1.12,
            }}>
              Frequently asked questions
            </h2>
            <p style={{ fontSize: 15.5, color: MUTE, margin: 0, maxWidth: 460, marginInline: "auto", lineHeight: 1.6 }}>
              Everything you need to know about enriching, verifying, and how credits work.
            </p>
          </div>

          {/* items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {faqs.map((faq, i) => {
              const open = openIndex === i;
              return (
                <div key={i} className="pr-faq-item"
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  style={{
                    background: "#fff", borderRadius: 16, cursor: "pointer",
                    border: `1.5px solid ${open ? "#c9d2f5" : "#e6e9f2"}`,
                    boxShadow: open ? "0 12px 30px rgba(57,83,251,.1)" : "0 1px 2px rgba(13,19,48,.04)",
                    overflow: "hidden",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 22px" }}>
                    <h3 className="pr-faq-q" style={{
                      margin: 0, fontSize: 16.5, fontWeight: 600,
                      color: open ? BRAND : INK,
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}>
                      {faq.q}
                    </h3>
                    <ChevronIcon open={open} />
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateRows: open ? "1fr" : "0fr",
                    transition: "grid-template-rows .4s cubic-bezier(.22,1,.36,1)",
                  }}>
                    <div style={{ overflow: "hidden" }}>
                      <p style={{
                        margin: 0, padding: "0 22px 22px", fontSize: 14.5,
                        lineHeight: 1.65, color: MUTE,
                      }}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* footer cta */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 14.5, color: MUTE, margin: 0 }}>
              Still have questions?{" "}
              <span style={{ color: BRAND, fontWeight: 600, cursor: "pointer" }}>Contact support</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
