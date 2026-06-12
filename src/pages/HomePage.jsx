import { useState, useEffect, useRef } from "react";

/**
 * Prospecto — Homepage / Landing
 * Marketing site for the B2B contact enrichment tool.
 * Structure inspired by salesgear.io, rebuilt in Prospecto's brand.
 *
 * Self-contained: inline styles + injected fonts/keyframes + scroll-reveal.
 * No external deps (icons inline SVG). Drop into a Vite + React app.
 *
 * Props:
 *   onGetStarted () => void   – primary CTA (signup)
 *   onLogin      () => void   – nav login link
 */

const BRAND = "#3953fb";
const BRAND_DARK = "#2a3ed4";
const INK = "#0d1330";
const MUTE = "#6b7280";
const BG = "#f4f6fc";

// ─── scroll reveal hook ─────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function Reveal({ children, delay = 0, style }) {
  const [ref, shown] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? "translateY(0)" : "translateY(28px)",
      transition: `opacity .7s ease ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── icons ──────────────────────────────────────────────────────────────
const Ic = {
  mail: "M4 4h16v16H4zM4 6l8 6 8-6",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
};

const Icon = ({ d, size = 22, stroke = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
  </svg>
);

const Logo = ({ size = 32, light }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: light ? "rgba(255,255,255,.15)" : `linear-gradient(145deg, ${BRAND}, #6a4bff)`, display: "grid", placeItems: "center", boxShadow: light ? "none" : "0 6px 16px rgba(57,83,251,.4)" }}>
      <span style={{ color: "#fff", fontWeight: 800, fontSize: size * 0.5, fontFamily: "'Bricolage Grotesque', sans-serif" }}>P</span>
    </div>
    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: light ? "#fff" : INK }}>
      Prosp<span style={{ color: light ? "#c9d2f5" : BRAND }}>ecto</span>
    </span>
  </div>
);

const features = [
  { d: Ic.mail, title: "Email Finder", text: "Give a name and company — get a verified work email back in seconds, with a deliverability status you can trust." },
  { d: Ic.phone, title: "Phone Finder", text: "Surface direct dials and mobile numbers so you can skip the gatekeeper and reach decision-makers faster." },
  { d: Ic.link, title: "LinkedIn Enrichment", text: "Drop in a profile or company URL and pull the full picture — title, company, location, email and phone." },
  { d: Ic.check, title: "Email Validation", text: "Upload a list and clean it in bulk — valid, risky, or undeliverable — before it ever hits your sequence." },
];

const demoSteps = [
  {
    n: "1",
    title: "Find",
    desc: "Search and discover emails, phone numbers, and LinkedIn profiles.",
    color: "#3953fb",
  },
  {
    n: "2",
    title: "Enrich",
    desc: "Generate complete contact and company information instantly.",
    color: "#6a4bff",
  },
  {
    n: "3",
    title: "Validate",
    desc: "Verify emails before outreach to improve deliverability.",
    color: "#00c48c",
  },
  {
    n: "4",
    title: "Export & Scale",
    desc: "Download results and grow your prospecting workflow.",
    color: "#ff8c00",
  }
];

function StepMockup({ step, BRAND, INK, MUTE }) {
  if (step === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "24px 28px", height: "100%", justifyContent: "center" }}>
        <div style={{ display: "flex", border: "1.5px solid #e6e9f2", borderRadius: 10, padding: "8px 12px", background: "#f8f9fd", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: INK, fontWeight: 600 }}>Sarah Chen</span>
          <span style={{ fontSize: 12, color: MUTE }}>·</span>
          <span style={{ fontSize: 13, color: INK }}>Acme Inc.</span>
          <div style={{ marginLeft: "auto", background: BRAND, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>Search</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eef0f6", padding: 14, boxShadow: "0 10px 25px rgba(13,19,48,.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTE, marginBottom: 8 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: BRAND, animation: "prPulse 1.5s infinite" }} />
            Searching contact details...
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ height: 6, background: "#eef0f6", borderRadius: 4, width: "80%" }} />
            <div style={{ height: 6, background: "#eef0f6", borderRadius: 4, width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "24px 28px", height: "100%", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e6e9f2", padding: 18, boxShadow: "0 15px 35px rgba(13,19,48,.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${BRAND}, #6a4bff)`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>SC</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Sarah Chen</div>
              <div style={{ fontSize: 11.5, color: MUTE }}>VP Sales · Acme Inc.</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid #f4f6fc", paddingBottom: 6 }}>
              <span style={{ color: MUTE }}>Email</span>
              <span style={{ fontWeight: 600, color: INK, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> s.chen@acme.com
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid #f4f6fc", paddingBottom: 6 }}>
              <span style={{ color: MUTE }}>Direct Dial</span>
              <span style={{ fontWeight: 600, color: INK }}>+1 (415) 555-0142</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: MUTE }}>LinkedIn</span>
              <span style={{ fontWeight: 600, color: BRAND }}>in/sarah-chen</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "24px 28px", height: "100%", justifyContent: "center" }}>
        {[
          ["s.chen@acme.com", "Valid", "#00c48c", "rgba(0,196,140,.1)"],
          ["j.smith@acme.com", "Risky", "#ff8c00", "rgba(255,140,0,.1)"],
          ["invalid@gmail.com", "Undeliverable", "#ff4d4d", "rgba(255,77,77,.1)"]
        ].map(([email, status, col, bgCol]) => (
          <div key={email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1.5px solid #e6e9f2", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 10px rgba(13,19,48,.02)" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>{email}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: col, background: bgCol, padding: "3px 8px", borderRadius: 6 }}>{status}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "24px 28px", height: "100%", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(57,83,251,.1)", display: "grid", placeItems: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 2 }}>prospects_export.csv</div>
        <div style={{ fontSize: 11.5, color: "#22c55e", fontWeight: 700 }}>Export Complete!</div>
      </div>
      <div style={{ width: "100%", height: 6, background: "#f4f6fc", borderRadius: 4, overflow: "hidden", border: "1px solid #e6e9f2" }}>
        <div style={{ height: "100%", background: BRAND, width: "100%", borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function HomePage({ onGetStarted, onLogin, onPricing }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);

  useEffect(() => {
    if (!autoCycle) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoCycle]);

  const handleFooterClick = (item) => {
    if (["Email Finder", "Phone Finder", "LinkedIn Enrichment", "Email Validation"].includes(item)) {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    } else if (item === "Pricing") {
      onPricing?.();
    } else if (item === "About" || item === "Careers") {
      document.getElementById("value-statement")?.scrollIntoView({ behavior: "smooth" });
    } else if (item === "Contact") {
      document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" });
    } else if (["Blog", "Help center", "API docs", "Status"].includes(item)) {
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .pr-h-body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: ${BG}; color: ${INK}; }
        .pr-cta { transition: transform .14s, box-shadow .2s; }
        .pr-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(57,83,251,.42); }
        .pr-ghost { transition: background .16s, border-color .16s, color .16s; }
        .pr-ghost:hover { background: rgba(57,83,251,.06); border-color: ${BRAND}; color: ${BRAND}; }
        .pr-feat { transition: transform .22s, box-shadow .25s, border-color .2s; }
        .pr-feat:hover { transform: translateY(-6px); box-shadow: 0 24px 50px rgba(13,19,48,.12); border-color: #c9d2f5; }
        .pr-float { animation: prFloat 6s ease-in-out infinite; }
        @keyframes prFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes prPulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .pr-navlink { color: #475069; font-weight: 600; font-size: 14.5px; cursor: pointer; transition: color .16s; }
        .pr-navlink:hover { color: ${BRAND}; }
        .pr-footer-link {
          font-size: 14px;
          color: rgba(255,255,255,.78);
          margin-bottom: 11px;
          cursor: pointer;
          transition: color .2s;
        }
        .pr-footer-link:hover {
          color: #fff;
        }
        @media (max-width: 860px) {
          .pr-hero-grid { grid-template-columns: 1fr !important; }
          .pr-hero-visual { display: none !important; }
          .pr-feat-grid { grid-template-columns: 1fr !important; }
          .pr-steps-grid { grid-template-columns: 1fr !important; }
          .pr-demo-grid { grid-template-columns: 1fr !important; }
          .pr-nav-links { display: none !important; }
          .pr-h1 { font-size: 38px !important; }
        }
      `}</style>

      <div className="pr-h-body">
        {/* ─── NAV ─── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 40px", background: scrolled ? "rgba(255,255,255,.85)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid #eceef5" : "1px solid transparent",
          transition: "background .3s, border-color .3s",
        }}>
          <Logo />
          <div className="pr-nav-links" style={{ display: "flex", gap: 30, alignItems: "center" }}>
            <span className="pr-navlink" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Product</span>
            <span className="pr-navlink" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>Solutions</span>
            <span className="pr-navlink" onClick={() => onPricing?.()}>Pricing</span>
            <span className="pr-navlink" onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })}>Resources</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="pr-navlink" onClick={() => onLogin?.()}>Log in</span>
            <button className="pr-cta" onClick={() => onGetStarted?.()} style={primaryBtn}>Get started free</button>
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <section style={{ position: "relative", overflow: "hidden", padding: "70px 40px 90px" }}>
          <div style={{ position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(circle, rgba(57,83,251,.18), transparent 70%)", pointerEvents: "none" }} />
          <div className="pr-hero-grid" style={{ position: "relative", maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 50, alignItems: "center" }}>
            {/* copy */}
            <div>
              <Reveal>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: BRAND, background: "rgba(57,83,251,.1)", padding: "7px 14px", borderRadius: 30, marginBottom: 22 }}>
                  ● B2B Contact Intelligence
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="pr-h1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 54, lineHeight: 1.05, margin: "0 0 18px" }}>
                  Turn a single email into a <span style={{ color: BRAND }}>complete prospect.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ fontSize: 17.5, color: MUTE, lineHeight: 1.6, margin: "0 0 30px", maxWidth: 480 }}>
                  Find verified emails, direct phone numbers and full LinkedIn profiles — then validate your lists in bulk. Power your outbound with data you can actually trust.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <button className="pr-cta" onClick={() => onGetStarted?.()} style={{ ...primaryBtn, padding: "15px 28px", fontSize: 16 }}>Start building your pipeline</button>
                  <button className="pr-ghost" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} style={{ ...ghostBtn, padding: "15px 28px", fontSize: 16 }}>See how it works</button>
                </div>
              </Reveal>
            </div>

            {/* visual: floating enrichment card */}
            <div className="pr-hero-visual" style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div className="pr-float" style={{ background: "#fff", borderRadius: 22, padding: "24px 26px", width: 360, boxShadow: "0 40px 80px rgba(13,19,48,.18)", border: "1px solid #eef0f6" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND}, #6a4bff)`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>SC</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>Sarah Chen</div>
                      <div style={{ fontSize: 12.5, color: MUTE }}>VP Sales · Acme Inc.</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: BRAND, background: "rgba(57,83,251,.1)", padding: "4px 9px", borderRadius: 20 }}>ENRICHED</span>
                </div>
                {[["Email", "s.chen@acme.com", true], ["Phone", "+1 (415) 555‑0142", false], ["LinkedIn", "in/sarah‑chen", false]].map(([l, v, dot]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #eef0f6" }}>
                    <span style={{ fontSize: 12.5, color: MUTE, fontWeight: 500 }}>{l}</span>
                    <span style={{ fontSize: 13, color: INK, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />}{v}
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 13 }}>
                  <span style={{ fontSize: 12, color: MUTE }}>5 credits used</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#22c55e" }}>● Verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TRUST SECTION ─── */}
        <section style={{ padding: "35px 40px 60px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: 28,
              color: INK,
              margin: "0 0 14px",
              letterSpacing: "-0.01em",
              lineHeight: 1.2
            }}>
              <Reveal delay={0.05} style={{ display: "inline-block", marginRight: "12px" }}>
                Find<span style={{ color: BRAND }}>.</span>
              </Reveal>
              <Reveal delay={0.2} style={{ display: "inline-block", marginRight: "12px" }}>
                Enrich<span style={{ color: BRAND }}>.</span>
              </Reveal>
              <Reveal delay={0.35} style={{ display: "inline-block", marginRight: "12px" }}>
                Connect<span style={{ color: BRAND }}>.</span>
              </Reveal>
              <Reveal delay={0.5} style={{ display: "inline-block" }}>
                Scale<span style={{ color: BRAND }}>.</span>
              </Reveal>
            </h2>
            <Reveal delay={0.65}>
              <p style={{
                fontSize: 15.5,
                lineHeight: 1.6,
                color: MUTE,
                margin: 0,
                fontWeight: 500
              }}>
                Everything you need to discover contacts, enrich data, and grow smarter.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" style={{ padding: "70px 40px", background: "#fff" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 50 }}>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 38, margin: "0 0 12px" }}>Everything you need to reach the right people</h2>
                <p style={{ fontSize: 16, color: MUTE, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>Four tools, one workspace, one shared pool of credits.</p>
              </div>
            </Reveal>
            <div className="pr-feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 }}>
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div className="pr-feat" style={{ background: "#fff", border: "1.5px solid #e6e9f2", borderRadius: 18, padding: "28px 26px", height: "100%" }}>
                    <div style={{ width: 50, height: 50, borderRadius: 13, background: `linear-gradient(135deg, ${BRAND}, #6a4bff)`, display: "grid", placeItems: "center", marginBottom: 18, boxShadow: "0 8px 18px rgba(57,83,251,.3)" }}>
                      <Icon d={f.d} />
                    </div>
                    <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 21, margin: "0 0 8px" }}>{f.title}</h3>
                    <p style={{ fontSize: 14.5, color: MUTE, lineHeight: 1.6, margin: 0 }}>{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SEE PROSPECTO IN ACTION ─── */}
        <section id="how-it-works" style={{ padding: "90px 40px", background: "#f4f6fc" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <span style={{
                  fontSize: 12, letterSpacing: ".15em", fontWeight: 700, color: BRAND,
                  background: "rgba(57,83,251,.08)", padding: "6px 14px", borderRadius: 30,
                  textTransform: "uppercase"
                }}>
                  Product Demo
                </span>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 38, margin: "16px 0 12px", color: INK, lineHeight: 1.15 }}>
                  See Prospecto in Action
                </h2>
                <p style={{ fontSize: 16, color: MUTE, maxWidth: 580, margin: "0 auto", lineHeight: 1.6 }}>
                  Find contacts, enrich profiles, validate data, and build better outreach — all in one workflow.
                </p>
              </div>
            </Reveal>

            {/* Split layout demo */}
            <div className="pr-demo-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 40, alignItems: "stretch", marginBottom: 54 }}>
              {/* Left Column: Interactive Steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
                {demoSteps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <div key={idx}
                      onClick={() => { setActiveStep(idx); setAutoCycle(false); }}
                      style={{
                        background: "#fff",
                        borderRadius: 16,
                        border: `2.5px solid ${isActive ? BRAND : "#e6e9f2"}`,
                        padding: "20px 24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        boxShadow: isActive ? "0 12px 28px rgba(57,83,251,.08)" : "0 2px 4px rgba(13,19,48,.01)",
                        transition: "border-color .25s ease, box-shadow .25s ease, transform .15s ease",
                        transform: isActive ? "translateX(6px)" : "translateX(0)"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#c9d2f5";
                          e.currentTarget.style.boxShadow = "0 6px 16px rgba(13,19,48,.03)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#e6e9f2";
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(13,19,48,.01)";
                        }
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: isActive ? step.color : "rgba(13,19,48,.04)",
                        color: isActive ? "#fff" : INK,
                        display: "grid", placeItems: "center",
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 800, fontSize: 16,
                        flexShrink: 0,
                        transition: "background .2s, color .2s"
                      }}>
                        {step.n}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <h3 style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          fontWeight: 700, fontSize: 17.5,
                          color: isActive ? BRAND : INK,
                          margin: 0,
                          transition: "color .2s"
                        }}>
                          {step.title}
                        </h3>
                        <p style={{
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: isActive ? INK : MUTE,
                          margin: 0,
                          transition: "color .2s"
                        }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Visual Simulator Display */}
              <div style={{
                background: "#fff",
                border: "1.5px solid #e6e9f2",
                borderRadius: 24,
                boxShadow: "0 25px 60px rgba(13,19,48,.05)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
                minHeight: 320
              }}>
                {/* Visual Header Mock */}
                <div style={{
                  background: "#f8f9fd",
                  borderBottom: "1.5px solid #e6e9f2",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff4d4d" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffb800" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00c48c" }} />
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, color: MUTE,
                    marginLeft: 14, fontFamily: "'Bricolage Grotesque', sans-serif",
                    letterSpacing: ".04em"
                  }}>
                    PROSPECTO SIMULATOR
                  </span>
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <StepMockup step={activeStep} BRAND={BRAND} INK={INK} MUTE={MUTE} />
                </div>
              </div>
            </div>

            {/* Bottom persistent CTA block */}
            <div style={{ textAlign: "center" }}>
              <button className="pr-cta" onClick={() => onGetStarted?.()}
                style={{
                  ...primaryBtn,
                  padding: "16px 36px",
                  fontSize: 16.5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16
                }}
              >
                Start Finding Leads →
              </button>
              <p style={{ fontSize: 13.5, color: MUTE, fontWeight: 500, margin: 0 }}>
                Join teams using Prospecto to turn data into opportunities faster.
              </p>
            </div>
          </div>
        </section>

        {/* ─── VALUE STATEMENT (swap for a real, attributed customer quote once you have one) ─── */}
        <section id="value-statement" style={{ padding: "20px 40px 80px" }}>
          <Reveal>
            <div style={{ maxWidth: 820, margin: "0 auto", background: `radial-gradient(120% 140% at 0% 0%, #5a4bff, ${BRAND} 50%, ${BRAND_DARK})`, borderRadius: 24, padding: "48px 50px", color: "#fff", position: "relative", overflow: "hidden", textAlign: "center" }}>
              <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.1)", filter: "blur(60px)", top: -80, right: -60 }} />
              <div style={{ position: "relative" }}>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 32, lineHeight: 1.2, margin: "0 0 16px" }}>
                  Spend your day selling — not hunting for contact info
                </h2>
                <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,.85)", margin: 0, maxWidth: 560, marginInline: "auto" }}>
                  Verified emails and direct dials mean fewer bounces, more connects, and a list you can trust before you ever hit send.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section id="final-cta" style={{ padding: "20px 40px 90px" }}>
          <Reveal>
            <div style={{
              position: "relative",
              overflow: "hidden",
              maxWidth: 940,
              margin: "0 auto",
              textAlign: "center",
              background: `linear-gradient(135deg, ${INK}, #11183c)`,
              border: "1.5px solid #232c58",
              borderRadius: 28,
              padding: "64px 40px",
              boxShadow: "0 30px 70px rgba(13,19,48,.25)"
            }}>
              {/* Decorative radial glows */}
              <div style={{ position: "absolute", top: -150, left: -150, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(57,83,251,.25) 0%, transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -150, right: -150, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(106,75,255,.2) 0%, transparent 70%)`, pointerEvents: "none" }} />

              <h2 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: 42,
                color: "#fff",
                margin: "0 0 16px",
                lineHeight: 1.1,
                letterSpacing: "-0.01em"
              }}>
                Get started in seconds
              </h2>
              <p style={{
                fontSize: 16.5,
                color: "rgba(255,255,255,.82)",
                margin: "0 0 32px",
                maxWidth: 440,
                marginInline: "auto",
                lineHeight: 1.6,
                fontWeight: 500
              }}>
                Start free with 50 credits — no card required. Enrich your first prospect today.
              </p>
              
              <button
                onClick={() => onGetStarted?.()}
                style={{
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 36px",
                  cursor: "pointer",
                  background: "#fff",
                  color: BRAND,
                  fontWeight: 700,
                  fontSize: 16.5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: "0 10px 25px rgba(255,255,255,.15), 0 4px 10px rgba(57,83,251,.25)",
                  transition: "transform .15s ease, box-shadow .2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 14px 30px rgba(255,255,255,.25), 0 6px 15px rgba(57,83,251,.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(255,255,255,.15), 0 4px 10px rgba(57,83,251,.25)";
                }}
              >
                Start free
              </button>
            </div>
          </Reveal>
        </section>

        {/* ─── FOOTER ─── */}
        <footer id="footer" style={{ background: INK, color: "#fff", padding: "54px 40px 30px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 40, marginBottom: 40 }}>
              <div style={{ maxWidth: 280 }}>
                <Logo light />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginTop: 16 }}>
                  B2B contact intelligence — find, verify and enrich the people behind every deal.
                </p>
              </div>
              {[
                ["Product", ["Email Finder", "Phone Finder", "LinkedIn Enrichment", "Email Validation"]],
                ["Company", ["About", "Pricing", "Careers", "Contact"]],
                ["Resources", ["Blog", "Help center", "API docs", "Status"]],
              ].map(([h, items]) => (
                <div key={h}>
                  <div style={{ fontSize: 13, letterSpacing: ".1em", color: "rgba(255,255,255,.5)", fontWeight: 700, marginBottom: 16 }}>{h.toUpperCase()}</div>
                  {items.map((it) => (
                    <div key={it} className="pr-footer-link" onClick={() => handleFooterClick(it)}>{it}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 22, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, fontSize: 13, color: "rgba(255,255,255,.55)" }}>
              <span>© 2026 Prospecto. All rights reserved.</span>
              <span style={{ display: "flex", gap: 22 }}>
                <span style={{ cursor: "pointer" }}>Terms</span>
                <span style={{ cursor: "pointer" }}>Privacy</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ─── button atoms ───────────────────────────────────────────────────────
const primaryBtn = {
  border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer",
  background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff",
  fontWeight: 700, fontSize: 14.5, fontFamily: "'Plus Jakarta Sans', sans-serif",
  boxShadow: "0 8px 20px rgba(57,83,251,.32)",
};
const ghostBtn = {
  border: `1.5px solid #d4dbf3`, borderRadius: 12, padding: "11px 20px", cursor: "pointer",
  background: "transparent", color: INK, fontWeight: 700, fontSize: 14.5,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};
