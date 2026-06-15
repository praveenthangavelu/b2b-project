import { useState, useRef, useEffect } from "react";
import { API_BASE } from "../config";
import { getInitials } from "../utils/format";

/**
 * Prospecto — TopBar
 * Dashboard header: quick search + notification bell + "New Lookup" button.
 * Self-contained: inline styles + injected keyframes. No external deps.
 *
 * Props:
 *   onSearch          (q: string) => void   – fired on search submit/pick
 *   onNewLookup       () => void            – fired when "New Lookup" clicked
 *   searchSuggestions string[]              – optional autocomplete list
 *   notifications     {id,title,time,unread}[]  – optional notification list
 */

const BRAND = "#3953fb";
const BRAND_DARK = "#2a3ed4";
const INK = "#0d1330";
const MUTE = "#6b7280";

// ─── icons ──────────────────────────────────────────────────────────────
const SearchIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={active ? BRAND : MUTE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "stroke .2s" }} aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ClearIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DEFAULT_NOTIFS = [
  { id: 1, title: "Bulk validation finished — 482 emails checked", time: "2m ago", unread: true },
  { id: 2, title: "LinkedIn enrichment complete for Sarah Chen", time: "1h ago", unread: true },
  { id: 3, title: "Credit pack purchase successful (+500)", time: "Yesterday", unread: false },
];

export default function TopBar({
  onSearch,
  onSelectResult,
  onNewLookup,
  searchSuggestions = ["Email Finder", "Phone Finder", "LinkedIn Enrichment", "Email Validation"],
  notifications = DEFAULT_NOTIFS,
  user,
  onProfile,
  onSettings,
  onPlans,
  onBuyCredits,
  onFaq,
  onLogout,
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [results, setResults] = useState({
    "Files & Folders": [],
    "Sections & Fields": [],
    "Email Finder Jobs": [],
    "LinkedIn Enrichment Jobs": [],
    "Email Verification Jobs": [],
    "Job Records & Contacts": []
  });
  const [loading, setLoading] = useState(false);

  const unread = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults({
        "Files & Folders": [],
        "Sections & Fields": [],
        "Email Finder Jobs": [],
        "LinkedIn Enrichment Jobs": [],
        "Email Verification Jobs": [],
        "Job Records & Contacts": []
      });
      setActive(-1);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('prospecto_token');
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
          headers: {
            "Authorization": "Bearer " + token
          }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setActive(-1);
        }
      } catch (err) {
        console.error("Search API error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Flatten items to enable keyboard navigation across categories
  const flatItems = [];
  Object.entries(results).forEach(([category, items]) => {
    if (items && items.length > 0) {
      items.forEach(item => {
        flatItems.push({ ...item, category });
      });
    }
  });

  const getGlobalIndex = (category, idx) => {
    let offset = 0;
    const entries = Object.entries(results);
    for (const [cat, items] of entries) {
      if (cat === category) {
        return offset + idx;
      }
      if (items) {
        offset += items.length;
      }
    }
    return -1;
  };

  const handleSelect = (item, category) => {
    setQuery("");
    setFocused(false);
    onSelectResult?.({ ...item, category: category || item.category });
  };

  const showList = focused && (loading || flatItems.length > 0);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false); setBellOpen(false); setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const submit = (val) => {
    const q = (val ?? query).trim();
    if (!q) return;
    setQuery(q); setFocused(false); onSearch?.(q);
  };

  const onKeyDown = (e) => {
    if (!focused || flatItems.length === 0) {
      if (e.key === "Enter") submit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && active < flatItems.length) {
        handleSelect(flatItems[active]);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes prDrop { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes sp { to { transform: rotate(360deg); } }
        .pr-opt { transition: background .14s, color .14s; }
        .pr-icon-btn { transition: background .16s, border-color .16s, color .16s; }
        .pr-icon-btn:hover { background: #f3f5fc; border-color: #d4dbf3; color: ${BRAND}; }
        .pr-newlookup { transition: transform .14s, box-shadow .2s, filter .2s; }
        .pr-newlookup:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(57,83,251,.4); }
        .pr-newlookup:active { transform: translateY(0); }
        .pr-profile-btn { transition: transform .16s, border-color .16s, box-shadow .16s; }
        .pr-profile-btn:hover { transform: scale(1.04); border-color: #d4dbf3; box-shadow: 0 4px 12px rgba(57,83,251,.25); }
        .pr-profile-btn:active { transform: scale(1); }
      `}</style>

      <header ref={wrapRef} style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 18px", background: "#fff",
        height: 50,
        borderBottom: "1px solid #eceef5",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* ── search (grows to fill) ── */}
        <div style={{ position: "relative", flex: "1 1 auto", maxWidth: 460 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 36,
            background: "#f8f9fc", borderRadius: 9,
            border: `1.5px solid ${focused ? BRAND : "#e6e9f2"}`,
            boxShadow: focused ? "0 0 0 3px rgba(57,83,251,.1)" : "none",
            transition: "border-color .2s, box-shadow .2s, background .2s",
          }}>
            <SearchIcon active={focused} />
            <input
              ref={inputRef} value={query} placeholder="Quick search…"
              onChange={(e) => { setQuery(e.target.value); setActive(-1); }}
              onFocus={() => setFocused(true)} onKeyDown={onKeyDown}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: INK, fontFamily: "inherit" }}
            />
            {query && (
              <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Clear"
                style={{ background: "none", border: "none", color: MUTE, cursor: "pointer", display: "grid", placeItems: "center", padding: 2 }}>
                <ClearIcon />
              </button>
            )}
          </div>
          {showList && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 60,
              background: "#fff", borderRadius: 12, border: "1.5px solid #e6e9f2",
              boxShadow: "0 16px 40px rgba(13,19,48,.14)", animation: "prDrop .18s ease both",
              maxHeight: 480, overflowY: "auto", padding: 6
            }}>
              {loading && flatItems.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 12px", gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid rgba(57,83,251,.15)`, borderTopColor: BRAND, animation: "sp .7s linear infinite" }} />
                  <span style={{ fontSize: 13, color: MUTE, fontWeight: 500 }}>Searching…</span>
                </div>
              ) : (
                <>
                  {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderBottom: "1px solid #f3f5fc", marginBottom: 4 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid rgba(57,83,251,.15)`, borderTopColor: BRAND, animation: "sp .7s linear infinite" }} />
                      <span style={{ fontSize: 11, color: MUTE, fontWeight: 500 }}>Updating results…</span>
                    </div>
                  )}
                  {Object.entries(results).map(([category, items]) => {
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={category} style={{ marginBottom: 8 }}>
                        {/* Category Header */}
                        <div style={{
                          padding: "6px 12px",
                          fontSize: 10,
                          fontWeight: 700,
                          color: BRAND,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #f3f5fc",
                          marginBottom: 4
                        }}>
                          <span>{category}</span>
                          <span style={{ background: "#f1f3f9", padding: "1px 6px", borderRadius: 10, color: MUTE, fontSize: 9 }}>{items.length}</span>
                        </div>

                        {/* Category Items */}
                        {items.map((item, idx) => {
                          const globalIdx = getGlobalIndex(category, idx);
                          const isSelected = active === globalIdx;
                          return (
                            <div
                              key={idx}
                              className="pr-opt"
                              onMouseEnter={() => setActive(globalIdx)}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(item, category);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "8px 12px",
                                borderRadius: 8,
                                cursor: "pointer",
                                background: isSelected ? "rgba(57,83,251,.08)" : "transparent",
                                transition: "background .15s, color .15s",
                                minWidth: 0
                              }}
                            >
                              {/* Icon */}
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: isSelected ? "rgba(57,83,251,.15)" : "#f8f9fc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                flexShrink: 0
                              }}>
                                {item.icon || "🔍"}
                              </div>

                              {/* Text info */}
                              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                                <div style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: isSelected ? BRAND : INK,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}>
                                  {item.label}
                                </div>
                                {(item.path || item.sub) && (
                                  <div style={{
                                    fontSize: 10.5,
                                    color: isSelected ? BRAND_DARK : MUTE,
                                    opacity: isSelected ? 0.85 : 0.75,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    marginTop: 1
                                  }}>
                                    {item.path || item.sub}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* spacer pushes actions right */}
        <div style={{ flex: "1 1 0" }} />

        {/* ── notification bell ── */}
        <div style={{ position: "relative" }}>
          <button className="pr-icon-btn" onClick={() => setBellOpen((o) => !o)} aria-label="Notifications"
            style={{
              width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center",
              background: "#fff", border: "1.5px solid #e6e9f2", color: "#475069", cursor: "pointer", position: "relative",
            }}>
            <BellIcon />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: 5, right: 5, minWidth: 14, height: 14, padding: "0 3px",
                borderRadius: 7, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700,
                display: "grid", placeItems: "center", border: "1.5px solid #fff",
              }}>{unread}</span>
            )}
          </button>
          {bellOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 7px)", right: 0, width: 320, zIndex: 60,
              background: "#fff", borderRadius: 14, border: "1.5px solid #e6e9f2",
              boxShadow: "0 20px 50px rgba(13,19,48,.16)", animation: "prDrop .18s ease both", overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef0f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: INK, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Notifications</span>
                {unread > 0 && <span style={{ fontSize: 11.5, color: BRAND, fontWeight: 600 }}>{unread} new</span>}
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {notifications.length === 0 && (
                  <div style={{ padding: "26px 16px", textAlign: "center", fontSize: 13.5, color: MUTE }}>No notifications yet</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    display: "flex", gap: 10, padding: "13px 16px", borderBottom: "1px solid #f3f4f9",
                    background: n.unread ? "rgba(57,83,251,.035)" : "#fff",
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 6, flexShrink: 0, background: n.unread ? BRAND : "transparent" }} />
                    <div>
                      <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.4, fontWeight: n.unread ? 600 : 500 }}>{n.title}</div>
                      <div style={{ fontSize: 11.5, color: MUTE, marginTop: 3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "11px 16px", textAlign: "center", borderTop: "1px solid #eef0f6" }}>
                <span style={{ fontSize: 13, color: BRAND, fontWeight: 600, cursor: "pointer" }}>View all</span>
              </div>
            </div>
          )}
        </div>

        {/* ── New Lookup ── */}
        <button className="pr-newlookup" onClick={() => onNewLookup?.()}
          style={{
            display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px",
            border: "none", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap",
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, color: "#fff",
            fontSize: 13.5, fontWeight: 700, fontFamily: "inherit",
            boxShadow: "0 4px 12px rgba(57,83,251,.24)",
          }}>
          <PlusIcon /> New Lookup
        </button>

        {/* ── Profile dropdown ── */}
        <div style={{ position: "relative" }}>
          <button className="pr-profile-btn" onClick={() => setUserMenuOpen((o) => !o)} aria-label="User profile"
            style={{
              width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center",
              background: `linear-gradient(135deg, ${BRAND}, #7c3aed)`, color: "#fff", border: "1.5px solid #e6e9f2",
              fontWeight: 700, fontSize: 12, cursor: "pointer", position: "relative",
              boxShadow: "0 2px 6px rgba(57,83,251,.12)",
            }}>
            {getInitials(user?.name)}
          </button>
          {userMenuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 7px)", right: 0, width: 240, zIndex: 60,
              background: "#fff", borderRadius: 14, border: "1.5px solid #e6e9f2",
              boxShadow: "0 20px 50px rgba(13,19,48,.16)", animation: "prDrop .18s ease both", overflow: "hidden",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef0f6" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</div>
                <div style={{ fontSize: 12, color: MUTE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{user?.email || ""}</div>
              </div>
              <div style={{ padding: "6px 0" }}>
                {[
                  { label: "Profile", action: onProfile },
                  { label: "Settings", action: onSettings },
                  { label: "Plans", action: onPlans },
                  { label: "Billing & Credits", action: onBuyCredits },
                  { label: "Help", action: onFaq }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.action?.(); setUserMenuOpen(false); }}
                    className="pr-opt"
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 16px", background: "transparent",
                      border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 500, color: INK,
                      display: "block", transition: "background .14s, color .14s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(57,83,251,.05)"; e.currentTarget.style.color = BRAND; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = INK; }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #eef0f6", padding: "6px 0" }}>
                <button
                  onClick={() => { onLogout?.(); setUserMenuOpen(false); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 16px", background: "transparent",
                    border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#ef4444",
                    display: "block", transition: "background .14s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
