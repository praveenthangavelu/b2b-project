import { useState } from "react";

/**
 * Prospecto — Login / Sign Up
 * Split-screen B2B SaaS auth page.
 * Left  : credential form (login / signup toggle, Google + Apple SSO).
 * Right : brand panel with value props, floating enrichment preview, trust logos.
 *
 * Self-contained: inline styles + injected <style> for fonts, keyframes,
 * focus/hover states. No external UI deps (icons are inline SVG).
 * Drop into a Vite + React app. Wire onSubmit / onGoogle / onApple to your API.
 */

const BRAND = "#3953fb";
const BRAND_DARK = "#2a3ed4";
const INK = "#0d1330";
const MUTE = "#6b7280";

// ─── inline icons ─────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.5 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.4 12.8c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.8-3.6 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.2 0 1.9-1 2.6-2 .8-1.2 1.2-2.3 1.2-2.4-.1 0-2.2-.9-2.2-3.3zM14.2 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

// brand mark
const Logo = ({ size = 34 }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
    background: `linear-gradient(145deg, ${BRAND}, #6a4bff)`,
    display: "grid", placeItems: "center",
    boxShadow: "0 8px 22px rgba(57,83,251,.4)",
  }}>
    <span style={{ color: "#fff", fontWeight: 800, fontSize: size * 0.5, fontFamily: "'Bricolage Grotesque', sans-serif" }}>P</span>
  </div>
);

// small enrichment field row for the floating preview
const PreviewRow = ({ label, value, dot }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #eef0f6" }}>
    <span style={{ fontSize: 12, color: MUTE, fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 12.5, color: INK, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />}
      {value}
    </span>
  </div>
);

export default function LoginPage({ onSubmit, onGoogle, onApple, initialMode = "login", onBack }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  const handleSubmit = async () => {
    if (isSignup && !agree) return;
    setError("");
    setLoading(true);
    try {
      const res = await onSubmit?.({ mode, name, email, password });
      if (res && res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (onGoogle) {
      onGoogle();
    } else {
      alert("Google SSO is coming soon!");
    }
  };

  const handleAppleClick = () => {
    if (onApple) {
      onApple();
    } else {
      alert("Apple SSO is coming soon!");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        * { box-sizing: border-box; }
        .pr-input { transition: border-color .18s, box-shadow .18s, background .18s; }
        .pr-input:focus { outline: none; border-color: ${BRAND} !important; box-shadow: 0 0 0 4px rgba(57,83,251,.13); background: #fff !important; }
        .pr-cta { transition: transform .14s, box-shadow .2s, filter .2s; }
        .pr-cta:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 26px rgba(57,83,251,.42); }
        .pr-cta:active:not(:disabled) { transform: translateY(0); }
        .pr-cta:disabled { opacity: .55; cursor: not-allowed; }
        .pr-sso { transition: border-color .16s, background .16s, transform .12s; }
        .pr-sso:hover { border-color: #c3cbe6; background: #fafbff; transform: translateY(-1px); }
        .pr-link { color: ${BRAND}; cursor: pointer; font-weight: 600; }
        .pr-link:hover { text-decoration: underline; }
        .pr-tab { transition: color .18s; }
        .pr-float { animation: prFloat 6s ease-in-out infinite; }
        @keyframes prFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes prRise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        .pr-rise { animation: prRise .6s cubic-bezier(.22,1,.36,1) both; }
        @media (max-width: 920px) { .pr-right { display: none !important; } .pr-left { flex: 1 1 100% !important; } }
      `}</style>

      <div style={{
        height: "100vh", width: "100%", display: "flex", overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#f4f6fc",
      }}>
        {/* ─── LEFT: form ─────────────────────────────────────────── */}
        <div className="pr-left" style={{
          flex: "1 1 46%", display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          padding: "20px 24px", background: "#fff",
          overflow: "hidden",
        }}>
          <div className="pr-rise" style={{ width: "100%", maxWidth: 400, margin: "auto 0" }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: "none",
                  border: "none",
                  color: MUTE,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14.5,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  transition: "color .15s ease",
                  padding: 0,
                  marginBottom: 16,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = BRAND)}
                onMouseLeave={(e) => (e.currentTarget.style.color = MUTE)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to home
              </button>
            )}
            {/* brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <Logo />
              <div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 21, color: INK, lineHeight: 1 }}>
                  Prosp<span style={{ color: BRAND }}>ecto</span>
                </div>
                <div style={{ fontSize: 10, letterSpacing: ".18em", color: MUTE, fontWeight: 600, marginTop: 3 }}>
                  B2B INTELLIGENCE
                </div>
              </div>
            </div>

            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700,
              fontSize: 26, color: INK, margin: "0 0 4px", lineHeight: 1.1,
            }}>
              {isSignup ? "Get started now" : "Welcome back"}
            </h1>
            <p style={{ fontSize: 13.5, color: MUTE, margin: "0 0 16px" }}>
              {isSignup ? "Create your account to start enriching." : "Sign in to your prospecting workspace."}
            </p>

            {/* SSO */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <button className="pr-sso" onClick={handleGoogleClick} style={ssoBtn}>
                <GoogleIcon /> Google
              </button>
              <button className="pr-sso" onClick={handleAppleClick} style={ssoBtn}>
                <AppleIcon /> Apple
              </button>
            </div>

            {/* divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 14px" }}>
              <div style={{ flex: 1, height: 1, background: "#e6e9f2" }} />
              <span style={{ fontSize: 12, color: "#9aa1b5", fontWeight: 500 }}>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: "#e6e9f2" }} />
            </div>

            {/* name (signup only) */}
            {isSignup && (
              <Field label="Full name">
                <input className="pr-input" style={input} placeholder="Jane Cooper"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
            )}

            <Field label="Work email">
              <input className="pr-input" style={input} type="email" placeholder="you@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>

            <Field label="Password" right={!isSignup && <span className="pr-link" style={{ fontSize: 12.5 }}>Forgot?</span>}>
              <div style={{ position: "relative" }}>
                <input className="pr-input" style={{ ...input, paddingRight: 44 }}
                  type={showPw ? "text" : "password"}
                  placeholder={isSignup ? "Min. 8 characters" : "••••••••"}
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={() => setShowPw((s) => !s)} aria-label="Toggle password"
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: MUTE, cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <EyeIcon off={!showPw} />
                </button>
              </div>
            </Field>

            {/* terms (signup only) */}
            {isSignup && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 9, margin: "4px 0 12px", cursor: "pointer", fontSize: 12.5, color: MUTE }}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: BRAND, marginTop: 1, cursor: "pointer" }} />
                <span>I agree to the <span className="pr-link">Terms</span> & <span className="pr-link">Privacy Policy</span>.</span>
              </label>
            )}

            {error && (
              <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
                {error}
              </div>
            )}

            <button className="pr-cta" onClick={handleSubmit} disabled={(isSignup && !agree) || loading}
              style={{
                width: "100%", marginTop: isSignup ? 0 : 4, padding: "11px", border: "none", borderRadius: 12,
                background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff",
                fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 8px 20px rgba(57,83,251,.32)",
              }}>
              {loading ? (isSignup ? "Creating account..." : "Logging in...") : (isSignup ? "Create account" : "Log in")}
            </button>

            <p style={{ textAlign: "center", fontSize: 13.5, color: MUTE, marginTop: 12 }}>
              {isSignup ? "Already have an account? " : "New to Prospecto? "}
              <span className="pr-link" onClick={() => { setMode(isSignup ? "login" : "signup"); setError(""); }}>
                {isSignup ? "Sign in" : "Create one free"}
              </span>
            </p>
          </div>
        </div>

        {/* ─── RIGHT: brand panel ─────────────────────────────────── */}
        <div className="pr-right" style={{
          flex: "1 1 54%", position: "relative", overflow: "hidden",
          background: `radial-gradient(120% 120% at 0% 0%, #5a4bff 0%, ${BRAND} 42%, ${BRAND_DARK} 100%)`,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "56px 60px", color: "#fff",
        }}>
          {/* atmosphere */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "46px 46px", maskImage: "radial-gradient(120% 90% at 70% 30%, #000 30%, transparent 80%)" }} />
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "rgba(255,255,255,.12)", filter: "blur(70px)", top: -80, right: -60 }} />

          <div style={{ position: "relative", maxWidth: 460 }}>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700,
              fontSize: 36, lineHeight: 1.12, margin: "0 0 18px",
            }}>
              Turn a single email into a complete prospect.
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "rgba(255,255,255,.82)", margin: "0 0 30px", maxWidth: 420 }}>
              Find emails, phones and LinkedIn profiles, then verify your lists in bulk — all from one workspace.
            </p>

            {/* value props */}
            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 36 }}>
              {[
                "Enrich contacts from email, phone, or LinkedIn URL",
                "Validate thousands of emails in a single upload",
                "Pay only for successful lookups — credits never wasted",
              ].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <CheckIcon />
                  </span>
                  <span style={{ fontSize: 14.5, color: "rgba(255,255,255,.95)" }}>{t}</span>
                </div>
              ))}
            </div>

            {/* floating enrichment preview */}
            <div className="pr-float" style={{
              background: "#fff", borderRadius: 18, padding: "18px 20px", maxWidth: 330,
              boxShadow: "0 30px 60px rgba(13,19,48,.35)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${BRAND}, #6a4bff)`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>SC</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Sarah Chen</div>
                    <div style={{ fontSize: 11.5, color: MUTE }}>VP Sales · Acme Inc.</div>
                  </div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: BRAND, background: "rgba(57,83,251,.1)", padding: "3px 8px", borderRadius: 20 }}>ENRICHED</span>
              </div>
              <PreviewRow label="Email" value="s.chen@acme.com" dot />
              <PreviewRow label="Phone" value="+1 (415) 555‑0142" />
              <PreviewRow label="LinkedIn" value="in/sarah‑chen" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}>
                <span style={{ fontSize: 11.5, color: MUTE }}>5 credits used</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#22c55e" }}>● Verified</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// ─── style atoms + field wrapper ────────────────────────────────────────────
const input = {
  width: "100%", padding: "9px 12px", borderRadius: 11,
  border: "1.5px solid #e1e5f0", background: "#f8f9fc",
  fontSize: 14, color: INK, fontFamily: "inherit",
};

const ssoBtn = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
  padding: "9px 11px", borderRadius: 11, border: "1.5px solid #e1e5f0",
  background: "#fff", color: INK, fontWeight: 600, fontSize: 14, cursor: "pointer",
  fontFamily: "inherit",
};

function Field({ label, right, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}
