import { useState } from "react";

/**
 * Prospecto — Pricing / Plans
 * Credit-based tiers for a B2B contact enrichment tool.
 * Centered header and toggle.
 * Stretched layout to occupy full page height without empty space.
 *
 * Props:
 *   onSelectPlan  (planName: string, billing: 'monthly'|'yearly') => void
 *   onBack        () => void
 */

const BRAND = "#3953fb";
const BRAND_DARK = "#2a3ed4";
const INK = "#0d1330";
const MUTE = "#6b7280";

const plans = [
  {
    name: "Free",
    blurb: "Try Prospecto and enrich your first contacts.",
    monthly: 0,
    yearly: 0,
    credits: "50 credits / month",
    cta: "Start free",
    popular: false,
    features: [
      "Email Finder & Email Validation",
      "Single-contact lookups",
      "CSV export (up to 50 rows)",
      "1 user seat",
    ],
  },
  {
    name: "Pro",
    blurb: "For active prospectors who need volume and every tool.",
    monthly: 39,
    yearly: 374, // ~20% off (39*12=468)
    credits: "2,000 credits / month",
    cta: "Upgrade to Pro",
    popular: true,
    features: [
      "All tools — Email, Phone & LinkedIn enrichment",
      "Bulk mode — CSV upload & export",
      "Cached results never charged",
      "Lookup history & re-export",
      "3 user seats",
      "Priority email support",
    ],
  },
  {
    name: "Business",
    blurb: "For teams running enrichment at scale with API access.",
    monthly: 99,
    yearly: 950, // ~20% off (99*12=1188)
    credits: "6,000 credits / month",
    cta: "Choose Business",
    popular: false,
    features: [
      "Everything in Pro, plus:",
      "API access for your own integrations",
      "Higher bulk limits & concurrency",
      "Team management & shared credits",
      "10 user seats",
      "Dedicated support & onboarding",
    ],
  },
];

const Check = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke={BRAND} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={open ? BRAND : INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform .3s cubic-bezier(.22,1,.36,1)", transform: open ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }}
    aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const pricingFaqs = [
  {
    q: "How do credits work?",
    a: "Credits are deducted based on the type of enrichment: finding a verified email is 1 credit, LinkedIn profile lookup is 5 credits, and mobile/phone finder is 10 credits. Credits are spent on successful lookups — never on misses or cached data.",
  },
  {
    q: "Do unused credits rollover to the next month?",
    a: "Yes, unused credits from monthly subscriptions rollover for up to 3 billing cycles as long as your account remains active. Credits from one-time top-up packs never expire.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 14-day refund policy for all plans, provided you have used less than 20% of your plan's credits. Simply reach out to our support team and we will assist you.",
  },
  {
    q: "Can I upgrade or downgrade my plan at any time?",
    a: "Absolutely. Upgrades take effect immediately and are pro-rated. Downgrades take effect at the start of your next billing cycle. You can manage this from your settings page.",
  },
  {
    q: "What happens if I run out of credits mid-month?",
    a: "If you hit your credit limit, you can buy a one-time top-up pack, upgrade to a higher tier plan, or wait until your next billing cycle resets your balance.",
  },
  {
    q: "Are there setup fees or long-term contracts?",
    a: "No. All Prospecto plans are month-to-month or yearly, with no hidden setup fees, cancellation costs, or contracts. You can cancel your subscription at any time.",
  }
];

export default function PricingSection({ onSelectPlan, onBack }) {
  const [yearly, setYearly] = useState(false);
  const [selected, setSelected] = useState("Pro"); // currently chosen plan
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes prRise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        .pr-plan {
          animation: prRise .4s cubic-bezier(.22,1,.36,1) both;
          transition: transform .2s, box-shadow .25s;
          min-height: 560px;
        }
        .pr-plan:hover { transform: translateY(-2px); }
        .pr-pbtn { transition: transform .14s, box-shadow .2s, background .2s, color .2s; }
        .pr-pbtn:hover { transform: translateY(-1px); }
        .pr-toggle-btn { transition: color .2s; }
        .pr-faq-item {
          background: #fff;
          border-radius: 12px;
          cursor: pointer;
          border: 1.5px solid #e6e9f2;
          box-shadow: 0 1px 2px rgba(13,19,48,.02);
          transition: border-color .2s, box-shadow .25s, background .2s;
        }
        .pr-faq-item:hover {
          border-color: #c9d2f5;
          box-shadow: 0 6px 16px rgba(13,19,48,.04);
        }
        .pr-faq-item.pr-faq-open {
          border-color: #c9d2f5;
          box-shadow: 0 8px 20px rgba(57,83,251,.06);
        }
        .pr-faq-q { transition: color .2s; }
        @media (max-width: 880px) { 
          .pr-grid { grid-template-columns: 1fr !important; } 
        }
      `}</style>

      <section className="pr-section" style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#f4f6fc", padding: "24px 20px", position: "relative", overflowY: "auto",
        height: "100%", display: "flex", flexDirection: "column",
        borderRadius: 16, border: "1px solid #e2e6ff"
      }}>
        {/* glow */}
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 500, height: 200, background: "radial-gradient(circle, rgba(57,83,251,.1), transparent 70%)", pointerEvents: "none" }} />

        {/* Back Button - Top Left Absolute */}
        <button onClick={onBack} className="pr-pbtn" style={{
          position: "absolute", top: 16, left: 20, border: "1.5px solid #e6e9f2", background: "#fff",
          color: INK, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
          fontSize: 12, padding: "6px 12px", borderRadius: 8, transition: "background .2s", zIndex: 10
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f4f6fc"}
        onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
        >
          ← Back
        </button>

        <div style={{ position: "relative", width: "100%", maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Centered Header */}
          <div style={{ textAlign: "center", marginBottom: 12, marginTop: 4 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 24, color: INK, margin: "0 0 6px", lineHeight: 1.15 }}>
              Pricing that scales with your{" "}
              <span style={{
                color: BRAND, border: `1.2px dashed ${BRAND}`, background: "rgba(57,83,251,.08)",
                padding: "2px 10px", borderRadius: 8, display: "inline-block"
              }}>
                pipeline
              </span>
            </h2>
            <p style={{ fontSize: 12, color: MUTE, maxWidth: 540, margin: "0 auto", lineHeight: 1.4 }}>
              You only spend credits on successful lookups — failures and cached results are always free.
            </p>
          </div>

          {/* Centered Billing Toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", background: "#fff", border: "1.5px solid #e6e9f2", borderRadius: 40, padding: 3, position: "relative", width: 220 }}>
              <span style={{
                position: "absolute", top: 3, bottom: 3, left: 3, width: "calc(50% - 3px)", borderRadius: 30,
                background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                boxShadow: "0 3px 8px rgba(57,83,251,.2)",
                transform: yearly ? "translateX(100%)" : "translateX(0)",
                transition: "transform .2s cubic-bezier(.22,1,.36,1)",
              }} />
              <button className="pr-toggle-btn" onClick={() => setYearly(false)}
                style={{ flex: "1 1 0", position: "relative", zIndex: 1, border: "none", background: "none", cursor: "pointer", padding: "6px 0", borderRadius: 30, fontSize: 11.5, fontWeight: 600, color: yearly ? MUTE : "#fff", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Monthly
              </button>
              <button className="pr-toggle-btn" onClick={() => setYearly(true)}
                style={{ flex: "1 1 0", position: "relative", zIndex: 1, border: "none", background: "none", cursor: "pointer", padding: "6px 0", borderRadius: 30, fontSize: 11.5, fontWeight: 600, color: yearly ? "#fff" : MUTE, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                Yearly
                <span style={{ fontSize: 9, fontWeight: 700, background: yearly ? "rgba(255,255,255,.22)" : "rgba(57,83,251,.1)", color: yearly ? "#fff" : BRAND, padding: "1px 5px", borderRadius: 20 }}>
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* plans grid */}
          <div className="pr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "stretch", flex: 1, minHeight: 0 }}>
            {plans.map((plan, i) => {
              const price = yearly ? plan.yearly : plan.monthly;
              const pop = plan.popular;
              const isSelected = selected === plan.name;
              const choose = () => { setSelected(plan.name); onSelectPlan?.(plan.name, yearly ? "yearly" : "monthly"); };
              return (
                <div key={plan.name} className="pr-plan" onClick={choose}
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    background: "#fff", cursor: "pointer",
                    border: isSelected ? `2.5px solid ${BRAND}` : "1.5px solid #e6e9f2",
                    borderRadius: 16, padding: "32px 28px", display: "flex", flexDirection: "column",
                    boxShadow: isSelected ? "0 12px 28px rgba(57,83,251,.12)" : "0 2px 6px rgba(13,19,48,.02)",
                    position: "relative",
                  }}>
                  {pop && (
                    <span style={{ position: "absolute", top: -10.5, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff", fontSize: 9.5, fontWeight: 700, padding: "3px 12px", borderRadius: 20, boxShadow: "0 3px 8px rgba(57,83,251,.25)", whiteSpace: "nowrap" }}>
                      Most popular
                    </span>
                  )}

                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 20, color: INK, margin: "0 0 8px" }}>{plan.name}</h3>
                  <p style={{ fontSize: 13, color: MUTE, lineHeight: 1.55, margin: "0 0 24px" }}>{plan.blurb}</p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 36, color: INK }}>${price}</span>
                    <span style={{ fontSize: 13.5, color: MUTE }}>/{yearly ? "year" : "month"}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: BRAND, marginBottom: 24 }}>{plan.credits}</div>

                  <button className="pr-pbtn" onClick={(e) => { e.stopPropagation(); choose(); }}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 24,
                      border: isSelected ? "none" : `1.2px solid ${INK}`,
                      background: isSelected ? `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` : "transparent",
                      color: isSelected ? "#fff" : INK,
                      boxShadow: isSelected ? "0 4px 10px rgba(57,83,251,.2)" : "none",
                    }}>
                    {isSelected ? "✓ Selected" : plan.cta}
                  </button>

                  {/* Features list using flex: 1 and dynamic padding and spacing */}
                  <ul style={{
                    listStyle: "none", margin: 0, padding: "24px 0 0", borderTop: "1px solid #eef0f6",
                    display: "flex", flexDirection: "column", gap: "16px", flex: 1
                  }}>
                    {plan.features.map((f, fi) => {
                      const isHeader = f.endsWith("plus:") || f.endsWith("plus:");
                      return (
                        <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: isHeader ? INK : "#475069", fontWeight: isHeader ? 700 : 500 }}>
                          {!isHeader && (
                            <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(57,83,251,.08)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                              <Check />
                            </span>
                          )}
                          <span style={{ lineHeight: 1.5 }}>{f}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div style={{ marginTop: 40, borderTop: "1.5px solid #e6e9f2", paddingTop: 32, paddingBottom: 16 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <span style={{
                fontSize: 11, letterSpacing: ".15em", fontWeight: 700, color: BRAND,
                background: "rgba(57,83,251,.08)", padding: "4px 10px", borderRadius: 30,
                textTransform: "uppercase"
              }}>
                Billing FAQ
              </span>
              <h3 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700,
                fontSize: 20, color: INK, margin: "10px 0 6px", lineHeight: 1.2
              }}>
                Pricing & Usage Questions
              </h3>
              <p style={{ fontSize: 12, color: MUTE, maxWidth: 480, margin: "0 auto", lineHeight: 1.4 }}>
                Everything you need to know about our subscription tiers, credit usage, and refund policies.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 800, margin: "0 auto" }}>
              {pricingFaqs.map((faq, i) => {
                const open = openIndex === i;
                return (
                  <div key={i} className={`pr-faq-item ${open ? "pr-faq-open" : ""}`}
                    onClick={() => setOpenIndex(open ? -1 : i)}
                    style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px" }}>
                      <h4 className="pr-faq-q" style={{
                        margin: 0, fontSize: 13.5, fontWeight: 700,
                        color: open ? BRAND : INK,
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                      }}>
                        {faq.q}
                      </h4>
                      <ChevronIcon open={open} />
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateRows: open ? "1fr" : "0fr",
                      transition: "grid-template-rows .3s cubic-bezier(.22,1,.36,1)",
                    }}>
                      <div style={{ overflow: "hidden" }}>
                        <p style={{
                          margin: 0, padding: "0 16px 14px 16px", fontSize: 12,
                          lineHeight: 1.5, color: MUTE,
                        }}>
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
