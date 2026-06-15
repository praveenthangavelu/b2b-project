import { useState, useRef, useEffect, useCallback } from "react";
import { API_BASE } from "./config";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import TopBar from "./components/TopBar";
import PricingSection from "./pages/PricingSection";
import "./styles/global.css";

import { CreditsProvider, useCredits } from "./context/CreditsContext";
import { C } from "./constants/theme";
import { EF_FIELDS, PF_FIELDS, LE_FIELDS, EF_COL, PF_COL, LE_COL, CREDITS, NAV } from "./constants/fields";
import { useDismiss } from "./hooks/useDismiss";
import { apiLogin, apiRegister, apiGetMe, enrichFetch } from "./services/api";
import { getInitials, formatJobDate, exportDate, timeAgo, csvCell, triggerDownload } from "./utils/format";
import { ModeToggle } from "./components/ui/ModeToggle";
import { StepBar } from "./components/ui/StepBar";
import { CreditInfo } from "./components/ui/CreditInfo";
import { PageHeader } from "./components/ui/PageHeader";
import { ExportMenu } from "./components/ExportMenu";
import { FieldModal } from "./components/modals/FieldModal";
import { BuyCreditsModal } from "./components/modals/BuyCreditsModal";
import { ProfileModal } from "./components/modals/ProfileModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { FaqModal } from "./components/modals/FaqModal";
import { CodeFileModal } from "./components/modals/CodeFileModal";
import { NewLookupModal } from "./components/modals/NewLookupModal";
import { Sidebar } from "./components/Sidebar";

function refreshUser() { window.dispatchEvent(new Event('prospecto:refresh-user')); }
function promptBuyCredits() { window.dispatchEvent(new Event('prospecto:buy-credits')); }


/* ─── RESULT CARD ────────────────────────────────── */
const MOCK = {
  initials:"SC", name:"Sarah Chen", firstname:"Sarah", lastname:"Chen",
  title:"VP of Sales", company:"Nexlayer Inc.", domain:"nexlayer.io",
  location:"San Francisco, CA", industry:"SaaS / B2B", size:"201–500",
  revenue:"$12M ARR", email:"sarah.chen@nexlayer.io", phone:"+1 (415) 882-3310",
  linkedin:"linkedin.com/in/sarah-chen-sales", twitter:"@sarahchen_biz",
  score:94, seniority:"VP / Director", mobile:"+1 (415) 882-3310",
  dept:"Sales", hq:"United States",
};

function ResultCard({ sel, fields, creditsUsed, data }) {
  const D = data ? { ...MOCK, ...data, initials: getInitials(data.name || MOCK.name) } : MOCK;
  const status = data && data.status ? String(data.status).toLowerCase() : null;
  const statusColor = status === "valid" ? C.gr : status === "risky" ? C.am : C.re;
  const statusBg    = status === "valid" ? C.grL : status === "risky" ? C.amL : C.reL;
  const statusBd    = status === "valid" ? C.grB : status === "risky" ? C.amB : C.reB;
  return (
    <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 5px 24px rgba(57,83,251,.11)`, flexShrink:0 }}>
      <div style={{ height:3, background:`linear-gradient(90deg,${C.brand},#818cf8,${C.brand})` }}/>
      <div style={{ padding:"13px 16px" }}>
        {/* profile row */}
        <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:11 }}>
          <div style={{ width:40, height:40, borderRadius:11, flexShrink:0, background:`linear-gradient(135deg,${C.brand},#6d28d9)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:15, boxShadow:`0 4px 12px rgba(57,83,251,.38)` }}>{D.initials}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:C.g800 }}>{D.name}</span>
              {status ? (
                <div style={{ marginLeft:"auto", background:statusBg, border:`1px solid ${statusBd}`, borderRadius:6, padding:"2px 8px", display:"flex", alignItems:"center", gap:3 }}>
                  <span style={{ fontSize:9, fontWeight:800, color:statusColor, textTransform:"capitalize" }}>{status}</span>
                </div>
              ) : (
                <div style={{ marginLeft:"auto", background:C.grL, border:`1px solid ${C.grB}`, borderRadius:6, padding:"2px 8px", display:"flex", alignItems:"center", gap:3 }}>
                  <span style={{ fontSize:9 }}>⭐</span>
                  <span style={{ fontSize:9, fontWeight:800, color:C.gr }}>Score {D.score}/100</span>
                </div>
              )}
            </div>
            <div style={{ fontSize:10, color:C.g400 }}>
              <span style={{ fontWeight:600, color:C.g500 }}>{D.title}</span> · <span style={{ color:C.brand, fontWeight:700 }}>{D.company}</span> · {D.location}
            </div>
          </div>
        </div>
        {/* credit used badge */}
        {creditsUsed > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
            <span className="cr-badge"><span>🪙</span><b>{creditsUsed} Credit{creditsUsed > 1 ? "s" : ""}</b> used for this lookup</span>
          </div>
        )}
        {/* fields grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:7, marginBottom:10 }}>
          {sel.map(id => {
            const f   = fields.find(x => x.id === id);
            const val = D[id] || "—";
            const icon = f ? f.icon : "•";
            const lbl  = f ? f.label : id;
            return (
              <div key={id} style={{ background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:8, padding:"8px 10px", display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:26, height:26, borderRadius:7, flexShrink:0, background:C.lt, border:`1px solid ${C.mid}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{icon}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:8, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:1 }}>{lbl}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.g800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{val}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <ExportMenu style={{ flex:1 }} columns={sel.map(id => ({ key:id, label:(fields.find(f=>f.id===id)?.label)||id }))} rows={[Object.fromEntries(sel.map(id => [id, D[id] != null ? D[id] : ""]))]}/>
          <button className="bg" style={{ flex:1, padding:"8px", borderRadius:8, fontSize:11, fontWeight:700 }}>＋ Sequence</button>
          <button className="bs" style={{ flex:1, padding:"8px", borderRadius:8, fontSize:11, fontWeight:700 }}>☁ CRM</button>
        </div>
      </div>
    </div>
  );
}

/* ─── BULK RESULTS TABLE ─────────────────────────── */
const BULK_ROWS = [
  { first:"John",  last:"Doe",    domain:"acme.com",       email:"john.doe@acme.com",     phone:"+1 212 555 0101", mobile:"+1 917 555 0101", linkedin:"linkedin.com/in/johndoe",     title:"CEO",      co:"Acme Corp",    location:"New York, US",  seniority:"Executive",dept:"Sales",hq:"US",name:"John Doe",  firstname:"John", lastname:"Doe",  st:"found"   },
  { first:"—",     last:"—",      domain:"mailinator.com", email:"—",                     phone:"—",               mobile:"—",               linkedin:"—",                           title:"—",        co:"—",            location:"—",             seniority:"—",        dept:"—",  hq:"—",name:"—",         firstname:"—",    lastname:"—",    st:"notfound"},
  { first:"Mia",   last:"Patel",  domain:"startupxyz.io",  email:"mia@startupxyz.io",     phone:"+1 650 555 0202", mobile:"+1 512 555 0202", linkedin:"linkedin.com/in/miapatel",    title:"Founder",  co:"StartupXYZ",   location:"Austin, TX",    seniority:"Executive",dept:"Exec",hq:"US",name:"Mia Patel", firstname:"Mia",  lastname:"Patel",st:"found"   },
  { first:"—",     last:"—",      domain:"bigcorp.com",    email:"—",                     phone:"—",               mobile:"—",               linkedin:"—",                           title:"—",        co:"BigCorp",      location:"Chicago, IL",   seniority:"—",        dept:"—",  hq:"US",name:"—",         firstname:"—",    lastname:"—",    st:"partial" },
  { first:"Alex",  last:"Ross",   domain:"techventures.co",email:"alex@techventures.co",  phone:"+1 408 555 0303", mobile:"+1 650 555 0303", linkedin:"linkedin.com/in/alexross",    title:"CTO",      co:"TechVentures", location:"San Jose, CA",  seniority:"Executive",dept:"Eng", hq:"US",name:"Alex Ross",  firstname:"Alex", lastname:"Ross", st:"found"   },
  { first:"Dana",  last:"Wu",     domain:"cloudstack.dev", email:"dana.wu@cloudstack.dev",phone:"+1 415 555 0404", mobile:"+1 206 555 0404", linkedin:"linkedin.com/in/danawu",      title:"Dir. Eng", co:"CloudStack",   location:"Seattle, WA",   seniority:"Director", dept:"Eng", hq:"US",name:"Dana Wu",    firstname:"Dana", lastname:"Wu",   st:"found"   },
  { first:"Priya", last:"S.",     domain:"fintech.ai",     email:"priya@fintech.ai",      phone:"+44 20 7946 0505",mobile:"+44 77 5555 0505",linkedin:"linkedin.com/in/priyasharma", title:"VP Sales", co:"FintechAI",    location:"London, UK",    seniority:"VP",       dept:"Sales",hq:"UK",name:"Priya S.",   firstname:"Priya",lastname:"S.",   st:"found"   },
  { first:"—",     last:"—",      domain:"randomsite.org", email:"—",                     phone:"—",               mobile:"—",               linkedin:"—",                           title:"—",        co:"RandomSite",   location:"—",             seniority:"—",        dept:"—",  hq:"—",name:"—",         firstname:"—",    lastname:"—",    st:"notfound"},
];

const EV_SAMPLE = [
  { email:"sarah.chen@nexlayer.io",   status:"valid",   reason:"SMTP verified"           },
  { email:"hello@mailinator.com",      status:"invalid", reason:"Disposable domain"       },
  { email:"ceo@startupxyz.io",         status:"valid",   reason:"MX record found"         },
  { email:"noreply@bigcorp.com",       status:"risky",   reason:"Role-based address"      },
  { email:"alex@techventures.co",      status:"valid",   reason:"SMTP verified"           },
  { email:"test@tempmail.org",         status:"invalid", reason:"Catch-all detected"      },
  { email:"dana.wu@cloudstack.dev",    status:"valid",   reason:"SMTP verified"           },
  { email:"info@genericbiz.net",       status:"risky",   reason:"Catch-all server"        },
  { email:"priya@fintech.ai",          status:"valid",   reason:"SMTP verified"           },
  { email:"xyz@notareal.xyz",          status:"invalid", reason:"Domain not found"        },
];

function BulkTable({ bSel, fields, colKeys, creditsPerRecord, unitLabel }) {
  const [filter, setFilt] = useState("all");
  const { balance } = useCredits();
  const cts = { all:BULK_ROWS.length, found:BULK_ROWS.filter(r=>r.st==="found").length, partial:BULK_ROWS.filter(r=>r.st==="partial").length, notfound:BULK_ROWS.filter(r=>r.st==="notfound").length };
  const vis  = filter === "all" ? BULK_ROWS : BULK_ROWS.filter(r => r.st === filter);
  const shown = bSel.filter(id => colKeys[id]);
  const pct = v => Math.round((v / cts.all) * 100);
  const totalCost = cts.found * creditsPerRecord;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:8 }}>
      <StepBar step={2}/>
      {/* stat cards */}
      <div className="su" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, flexShrink:0 }}>
        {[
          { l:"Total",    v:cts.all,      c:C.brand, bg:C.lt,  bd:C.mid  },
          { l:"Found",    v:cts.found,    c:C.gr,    bg:C.grL, bd:C.grB  },
          { l:"Partial",  v:cts.partial,  c:C.am,    bg:C.amL, bd:C.amB  },
          { l:"Not Found",v:cts.notfound, c:C.re,    bg:C.reL, bd:C.reB  },
        ].map(s => (
          <div key={s.l} style={{ background:s.bg, border:`1.5px solid ${s.bd}`, borderRadius:11, padding:"10px 13px" }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:s.c, lineHeight:1, marginBottom:3 }}>{s.v}</div>
            <div style={{ fontSize:10, fontWeight:700, color:s.c, opacity:.75, marginBottom:5 }}>{s.l}</div>
            <div style={{ height:3, background:`${s.c}20`, borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${pct(s.v)}%`, height:"100%", borderRadius:99, background:s.c, transition:"width .8s cubic-bezier(.22,1,.36,1)" }}/>
            </div>
          </div>
        ))}
      </div>
      {/* credit summary */}
      <div className="su" style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:"#fffbeb", border:`1.5px solid ${C.amB}`, borderRadius:10, flexShrink:0 }}>
        <span style={{ fontSize:16 }}>🪙</span>
        <span style={{ fontSize:11, fontWeight:700, color:"#92400e" }}>
          <b>{totalCost} credits</b> used — {cts.found} {unitLabel || "records"} × {creditsPerRecord} credit{creditsPerRecord > 1 ? "s" : ""} each
        </span>
        <span style={{ marginLeft:"auto", fontSize:10, color:C.am, fontWeight:700 }}>Remaining balance: <b>{balance.toLocaleString()}</b></span>
      </div>
      {/* table */}
      <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:`linear-gradient(180deg,${C.g50},${C.w})`, flexWrap:"wrap", gap:5, flexShrink:0 }}>
          <div style={{ display:"flex", gap:5 }}>
            {[
              { id:"all",      l:"All",       cnt:cts.all,      ac:C.brand, ab:C.lt  },
              { id:"found",    l:"Found",     cnt:cts.found,    ac:C.gr,    ab:C.grL },
              { id:"partial",  l:"Partial",   cnt:cts.partial,  ac:C.am,    ab:C.amL },
              { id:"notfound", l:"Not Found", cnt:cts.notfound, ac:C.re,    ab:C.reL },
            ].map(f => (
              <button key={f.id} className="fb" onClick={() => setFilt(f.id)} style={{ padding:"4px 9px", borderRadius:6, fontSize:10, fontWeight:700, border:`1.5px solid ${filter===f.id?f.ac:C.g150}`, background:filter===f.id?f.ab:C.w, color:filter===f.id?f.ac:C.g400, boxShadow:filter===f.id?`0 2px 8px ${f.ac}28`:"none", transition:"all .14s" }}>{f.l} ({f.cnt})</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <div style={{ display:"flex", gap:4 }}>
              {bSel.slice(0,3).map(id => { const f = fields.find(x => x.id === id); return f ? <span key={id} style={{ fontSize:9, fontWeight:700, color:C.brand, background:C.lt, border:`1px solid ${C.mid}`, borderRadius:20, padding:"1px 7px" }}>{f.icon} {f.label}</span> : null; })}
              {bSel.length > 3 && <span style={{ fontSize:9, color:C.g400, background:C.g50, border:`1px solid ${C.g150}`, borderRadius:20, padding:"1px 7px", fontWeight:700 }}>+{bSel.length-3}</span>}
            </div>
            <button className="bb" style={{ borderRadius:6, padding:"5px 11px", fontSize:10, fontWeight:700 }}>⬇ Export</button>
          </div>
        </div>
        <div style={{ flex:1, minHeight:0, overflow:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
            <thead style={{ position:"sticky", top:0, zIndex:1 }}>
              <tr style={{ background:C.g50 }}>
                {["Input","Status",...shown.map(id => fields.find(f=>f.id===id)?.label||id)].map(h => (
                  <th key={h} style={{ padding:"7px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vis.map((r, i) => (
                <tr key={i} className="tr ri" style={{ background:i%2===0 ? C.w : C.g50, animationDelay:`${i*.025}s` }}>
                  <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, background:{ found:C.gr, partial:C.am, notfound:C.re }[r.st] }}/>
                      <span style={{ fontSize:11, fontWeight:700, color:C.g800, maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.email || r.linkedin || `${r.first} ${r.last}`}</span>
                    </div>
                  </td>
                  <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}>
                    <span style={{ fontSize:9, fontWeight:700, color:{ found:C.gr, partial:C.am, notfound:C.re }[r.st], background:{ found:C.grL, partial:C.amL, notfound:C.reL }[r.st], border:`1px solid ${{ found:C.grB, partial:C.amB, notfound:C.reB }[r.st]}`, borderRadius:5, padding:"2px 7px" }}>
                      {{ found:"Found", partial:"Partial", notfound:"Not Found" }[r.st]}
                    </span>
                  </td>
                  {shown.map(id => (
                    <td key={id} style={{ padding:"8px 13px", fontSize:11, borderBottom:`1px solid ${C.g100}`, fontWeight:500, color:r.st==="notfound" ? C.g300 : C.g700, maxWidth:130, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r[colKeys[id]] || "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:"7px 14px", borderTop:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`linear-gradient(180deg,${C.w},${C.g50})`, flexShrink:0 }}>
          <span style={{ fontSize:10, color:C.g400 }}>Showing <b style={{ color:C.g700 }}>{vis.length}</b> of <b style={{ color:C.g700 }}>{cts.all}</b></span>
          <span style={{ fontSize:10, color:C.gr, fontWeight:800, display:"flex", alignItems:"center", gap:4 }}><span style={{ width:6, height:6, borderRadius:"50%", background:C.gr, display:"inline-block" }}/>Complete</span>
        </div>
      </div>
    </div>
  );
}

/* ─── BULK UPLOAD CARD ───────────────────────────── */
function BulkUploadCard({ title, hint, phText, onNext, drag, setDrag, fname, setFname, fileRef, toolKey }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
      <StepBar step={0}/>
      <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, overflowY:"auto", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
        <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:11 }}>
          {/* credit info at top */}
          <CreditInfo toolKey={toolKey} mode="bulk"/>
          {/* drop zone */}
          <div className="uz" onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFname(f.name); }}
            style={{ border:`2px dashed ${drag ? C.brand : C.mid}`, borderRadius:11, padding:"24px 16px", textAlign:"center", cursor:"pointer", background:drag ? C.lt : C.g50, transition:"all .2s" }}
          >
            <div style={{ fontSize:32, marginBottom:7, transition:"transform .18s", transform:drag ? "scale(1.14)" : "scale(1)" }}>📂</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:13, color:drag ? C.brand : C.g800, marginBottom:4 }}>{drag ? "Drop it!" : "Drop CSV or TXT file here"}</div>
            <button className="bb" onClick={e => { e.stopPropagation(); fileRef.current.click(); }} style={{ borderRadius:7, padding:"6px 16px", fontSize:11, fontWeight:700, marginBottom:4 }}>⬆ Upload file</button>
            <div style={{ fontSize:10, color:C.g400 }}>{hint}</div>
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display:"none" }} onChange={e => setFname(e.target.files[0]?.name || "")}/>
          </div>
          {fname && (
            <div className="fi" style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px", background:C.grL, border:`1.5px solid ${C.grB}`, borderRadius:9 }}>
              <span style={{ fontSize:17 }}>📄</span>
              <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:700, color:C.g800 }}>{fname}</div><div style={{ fontSize:9, color:C.g400, marginTop:1 }}>{BULK_ROWS.length} records detected · Est. <b>{BULK_ROWS.length * CREDITS[toolKey].cost} credits</b></div></div>
              <button className="bs" onClick={() => setFname("")} style={{ fontSize:10, fontWeight:700, borderRadius:7, padding:"3px 9px" }}>✕</button>
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ flex:1, height:1, background:C.g150 }}/><span style={{ fontSize:10, color:C.g400, fontWeight:600 }}>or paste manually</span><div style={{ flex:1, height:1, background:C.g150 }}/></div>
          <textarea className="inp" rows={3} placeholder={phText} style={{ borderRadius:8, padding:"9px 11px", fontSize:11, fontFamily:"'Courier New',monospace", resize:"none", lineHeight:1.8, width:"100%" }}/>
          <button className="bb" onClick={onNext} style={{ width:"100%", borderRadius:9, padding:"11px", fontSize:13, fontWeight:800 }}>Next → Select Fields to Generate</button>
        </div>
      </div>
    </div>
  );
}

/* ─── BULK LOADING ───────────────────────────────── */
function BulkLoading({ prog, bSel, fields }) {
  const ps = prog > 65 ? 2 : prog > 32 ? 1 : 0;
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
      <StepBar step={1}/>
      <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
        <div style={{ position:"relative", width:56, height:56, marginBottom:14 }}>
          <svg width="56" height="56" style={{ position:"absolute", inset:0 }}><circle cx="28" cy="28" r="23" fill="none" stroke={C.g150} strokeWidth="4"/></svg>
          <svg width="56" height="56" style={{ position:"absolute", inset:0 }}><circle cx="28" cy="28" r="23" fill="none" stroke={C.brand} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2*Math.PI*23*prog/100} ${2*Math.PI*23}`} style={{ filter:`drop-shadow(0 0 4px ${C.brand}88)`, transition:"stroke-dasharray .08s", transform:"rotate(-90deg)", transformOrigin:"center" }}/></svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, color:C.brand }}>{Math.floor(prog)}%</div>
        </div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.g800, marginBottom:4 }}>Enriching {BULK_ROWS.length} records…</div>
        <div style={{ fontSize:11, color:C.g400, marginBottom:12, textAlign:"center" }}>Fetching: {bSel.map(id => fields.find(f => f.id===id)?.label).filter(Boolean).join(", ")}</div>
        <div style={{ display:"flex", gap:14 }}>
          {[["Verifying",0],["Enriching",1],["Finalizing",2]].map(([l,s]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, color:ps>=s ? C.gr : C.g300, transition:"color .4s" }}>
              <span style={{ width:15, height:15, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:8, background:ps>=s ? C.grL : C.g100, border:`1px solid ${ps>=s ? C.grB : "#e2e8f0"}`, color:ps>=s ? C.gr : C.g400, transition:"all .4s" }}>{ps>s?"✓":"·"}</span>{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Email-only status pill helper (valid / risky / not found).
function emailStatusStyle(found, status) {
  const s = String(status || "").toLowerCase();
  if (found || s === "valid") return { label: "Valid", color: C.gr, bg: C.grL, bd: C.grB };
  if (s === "risky" || s.includes("catch")) return { label: "Risky", color: C.am, bg: C.amL, bd: C.amB };
  return { label: "Not found", color: C.re, bg: C.reL, bd: C.reB };
}

// Parse pasted/CSV rows: "First, Last, Domain-or-Company" per line.
function parseEmailRows(text) {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
    const parts = line.split(/[,\t]/).map(p => p.trim());
    const [first = "", last = "", target = ""] = parts;
    const isDomain = /\./.test(target) && !/\s/.test(target);
    return { first, last, domain: isDomain ? target : "", company: isDomain ? "" : target };
  }).filter(r => r.first && r.last && (r.domain || r.company));
}
function EmailFinder({ onNav, setPrefilledEmails, openJobId, clearOpenJobId, highlightVal, clearHighlightVal }) {
  const { balance, spend, canAfford, updateBalance } = useCredits();
  const [mode,setMode]     = useState("single");
  const [first,setFirst]   = useState(""); const [last,setLast] = useState(""); const [domain,setDomain] = useState(""); const [company,setCompany] = useState("");
  const [phase,setPhase]   = useState("idle"); // idle | loading | done | error
  const [result,setResult] = useState(null); const [err,setErr] = useState("");
  // bulk
  const [text,setText]     = useState(""); const [drag,setDrag] = useState(false); const [fname,setFname] = useState("");
  const [bPhase,setBPhase] = useState("idle"); // idle | loading | done
  const [bProg,setBProg]   = useState(0); const [bRows,setBRows] = useState([]); const [bFilter,setBFilter] = useState("all"); const [bErr,setBErr] = useState("");
  const fileRef = useRef();

  // History state
  const [histories, setHistories] = useState([]);
  const [historiesLoading, setHistoriesLoading] = useState(false);
  const [historyItemDetails, setHistoryItemDetails] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [jobQuery, setJobQuery] = useState("");

  const loadHistoriesList = async () => {
    setHistoriesLoading(true);
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + '/enrich/history?module=email', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setHistories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoriesLoading(false);
    }
  };

  const loadHistoryItemDetails = async (id) => {
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + `/enrich/history/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryItemDetails(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (openJobId) {
      setMode("history");
      loadHistoryItemDetails(openJobId);
      clearOpenJobId?.();
    }
  }, [openJobId]);

  useEffect(() => {
    if (historyItemDetails && highlightVal) {
      setTimeout(() => {
        const records = historyItemDetails.records || [];
        const rows = records.map(rec => rec.output).filter(Boolean);
        const match = rows.find(r => 
          (r.email && r.email.toLowerCase().includes(highlightVal.toLowerCase())) ||
          (r.first && r.first.toLowerCase().includes(highlightVal.toLowerCase())) ||
          (r.last && r.last.toLowerCase().includes(highlightVal.toLowerCase()))
        );
        if (match) {
          const rowId = `record_row_${(match.email || `${match.first}_${match.last}`).replace(/[^a-zA-Z0-9]/g, '_')}`;
          const el = document.getElementById(rowId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 500);
      clearHighlightVal?.();
    }
  }, [historyItemDetails, highlightVal]);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + `/enrich/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        loadHistoriesList();
      } else {
        alert("Failed to delete record");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete record");
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete the ${count} selected job(s)?`)) return;
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + '/enrich/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      if (res.ok) {
        setSelectedIds(new Set());
        loadHistoriesList();
      } else {
        alert("Failed to delete records");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete records");
    }
  };

  useEffect(() => {
    if (mode === "history") {
      loadHistoriesList();
      setHistoryItemDetails(null);
      setSelectedIds(new Set());
      setJobQuery("");
    }
  }, [mode]);

  const getExportPropsForJob = (item) => {
    const isBulk = item.processingType === "bulk";
    const columns = [
      { key: "name", label: "Name" },
      { key: "target", label: "Domain / Company" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" }
    ];

    if (isBulk) {
      const rows = (item.records || []).map(rec => {
        const r = rec.output || {};
        return {
          name: `${r.first || ""} ${r.last || ""}`.trim(),
          target: r.domain || r.company || "",
          email: r.email || "",
          status: emailStatusStyle(r.found, r.status).label
        };
      });
      return { columns, rows };
    } else {
      const r = item.records && item.records[0] ? item.records[0].output : {};
      const rows = [{
        name: `${r.first || ""} ${r.last || ""}`.trim(),
        target: r.domain || r.company || "",
        email: r.email || "",
        status: emailStatusStyle(r.found, r.status).label
      }];
      return { columns, rows };
    }
  };

  const exportColumns = [
    { key: "jobName", label: "Job Name" },
    { key: "jobDate", label: "Date / Time" },
    { key: "jobType", label: "Type" },
    { key: "name", label: "Name" },
    { key: "target", label: "Domain / Company" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" }
  ];

  const getExportDataForItems = (itemsList) => {
    const exportRows = [];
    itemsList.forEach(item => {
      const jobDateStr = formatJobDate(item.createdAt);
      const isBulk = item.processingType === "bulk";
      const jobInputStr = isBulk 
        ? `📁 Bulk Run (${item.records?.length || 0} records)` 
        : (item.records && item.records[0] ? item.records[0].inputVal : "—");
        
      (item.records || []).forEach(record => {
        const r = record.output || {};
        exportRows.push({
          jobName: item.jobName || "",
          jobDate: jobDateStr,
          jobType: item.processingType,
          name: `${r.first || ""} ${r.last || ""}`.trim(),
          target: r.domain || r.company || "",
          email: r.email || "",
          status: emailStatusStyle(r.found, r.status).label
        });
      });
    });
    return exportRows;
  };

  const filteredHistories = histories.filter(item => {
    if (!jobQuery.trim()) return true;
    const name = item.jobName || "";
    return name.toLowerCase().includes(jobQuery.toLowerCase().trim());
  });

  const canRun = first.trim() && last.trim() && domain.trim();

  const resetAll = () => {
    setPhase("idle"); setResult(null); setErr(""); setFirst(""); setLast(""); setDomain(""); setCompany(""); setText(""); setFname(""); setBPhase("idle"); setBProg(0); setBRows([]); setBFilter("all"); setBErr("");
    setHistoryItemDetails(null); setSelectedIds(new Set()); setJobQuery("");
  };

  const runFind = async () => {
    if (!canRun) return;
    if (!canAfford('email')) {
      promptBuyCredits();
      return;
    }
    setErr(""); setResult(null); setPhase("loading");
    const body = { first_name:first.trim(), last_name:last.trim() };
    const target = domain.trim();
    if (target.includes(".")) {
      body.domain = target;
    } else {
      body.company_name = target;
    }
    const { ok, status, data } = await enrichFetch('/enrich/email', body);
    if (ok) {
      setResult(data);
      setPhase("done");
      if (typeof data.credits === 'number') {
        updateBalance(data.credits);
      }
      refreshUser();

      // Save to history
      const token = localStorage.getItem('prospecto_token') || '';
      fetch(API_BASE + '/enrich/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          processingType: 'single',
          module: 'email',
          records: [{
            inputVal: `${first.trim()} ${last.trim()}`.trim(),
            output: {
              first: first.trim(),
              last: last.trim(),
              domain: target.includes(".") ? target : "",
              company: target.includes(".") ? "" : target,
              email: data.email,
              status: data.status,
              found: data.found,
              creditsCharged: data.creditsCharged || 1
            },
            status: 'done'
          }]
        })
      }).catch(e => console.error('Failed to save single history', e));
    }
    else {
      setErr(data.error || (status===402 ? "Out of credits" : "Lookup failed"));
      if (status === 402) promptBuyCredits();
      setPhase("error");
    }
  };

  const onFile = (file) => {
    if (!file) return;
    setFname(file.name);
    const reader = new FileReader();
    reader.onload = e => setText(String(e.target.result || ""));
    reader.readAsText(file);
  };

  const runBulk = async () => {
    const rows = parseEmailRows(text);
    if (!rows.length) { setBErr("Add rows as: First, Last, Domain (or company)"); return; }
    if (!canAfford('email', rows.length)) {
      setBErr("Out of credits for this bulk size");
      promptBuyCredits();
      return;
    }
    setBErr(""); setBPhase("loading"); setBProg(0); setBRows([]);
    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const body = { first_name:r.first, last_name:r.last };
      if (r.domain) body.domain = r.domain; else body.company_name = r.company;
      try {
        const { ok, status, data } = await enrichFetch('/enrich/email', body);
        if (!ok && status === 402) { setBErr("Out of credits — bulk stopped early"); promptBuyCredits(); break; }
        if (ok && typeof data.credits === 'number') {
          updateBalance(data.credits);
        }
        out.push({ ...r, email: ok ? data.email : null, status: ok ? data.status : "error", found: ok ? !!data.found : false });
      } catch {
        out.push({ ...r, email: null, status: "error", found: false });
      }
      setBProg(Math.round(((i + 1) / rows.length) * 100));
    }
    setBRows(out); setBPhase("done"); refreshUser();

    // Save bulk results to history
    const token = localStorage.getItem('prospecto_token') || '';
    const records = out.map(r => ({
      inputVal: `${r.first} ${r.last}`,
      output: r,
      status: r.status === "error" ? "failed" : "done",
      error: r.status === "error" ? "Lookup failed" : ""
    }));
    fetch(API_BASE + '/enrich/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        processingType: 'bulk',
        module: 'email',
        records
      })
    }).catch(e => console.error('Failed to save bulk history', e));
  };

  const bCts = { all:bRows.length, found:bRows.filter(r=>r.found).length, risky:bRows.filter(r=>!r.found && String(r.status).toLowerCase()==="risky").length, notfound:bRows.filter(r=>!r.found && String(r.status).toLowerCase()!=="risky").length };
  const visRows = bFilter==="all" ? bRows : bFilter==="found" ? bRows.filter(r=>r.found) : bFilter==="risky" ? bRows.filter(r=>!r.found && String(r.status).toLowerCase()==="risky") : bRows.filter(r=>!r.found && String(r.status).toLowerCase()!=="risky");

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
      {/* header row with toggle */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:C.lt, border:`1.5px solid ${C.mid}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>✉️</div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:C.g800 }}>Email Finder</div>
            <div style={{ fontSize:10, color:C.g400 }}>Find a verified email from name + domain or company</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button 
            className={`mode-btn${mode==="history" ? " active" : ""}`} 
            style={{ 
              background: mode==="history" ? C.brand : "#e2e6ff", 
              color: mode==="history" ? "#fff" : "#8892cc",
              border: "none",
              borderRadius: "99px",
              padding: "6px 20px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: mode==="history" ? `0 2px 10px ${C.brand}33` : "none",
              transition: "all .22s cubic-bezier(.22,1,.36,1)"
            }}
            onClick={() => { setMode("history"); resetAll(); }}
          >
            Jobs
          </button>
          <ModeToggle mode={mode} onChange={m=>{setMode(m);resetAll();}}/>
        </div>
      </div>

      {/* ── SINGLE ── */}
      {mode === "single" && (
        <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1, minHeight:0 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flexShrink:0 }}>
            <div style={{ marginBottom:12 }}><CreditInfo toolKey="email" mode="single"/></div>
            <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:9 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, pointerEvents:"none" }}>👤</span>
                  <input id="first_name_input" className="inp" value={first} onChange={e=>setFirst(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canRun&&runFind()} placeholder="First Name" style={{ width:"100%", padding:"10px 12px 10px 30px", borderRadius:8, fontSize:13, height:"42px", boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=C.brand;e.target.style.boxShadow=`0 0 0 3px ${C.brand}18`;}} onBlur={e=>{e.target.style.borderColor=C.g150;e.target.style.boxShadow="none";}}/>
                </div>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, pointerEvents:"none" }}>👤</span>
                  <input id="last_name_input" className="inp" value={last} onChange={e=>setLast(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canRun&&runFind()} placeholder="Last Name" style={{ width:"100%", padding:"10px 12px 10px 30px", borderRadius:8, fontSize:13, height:"42px", boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=C.brand;e.target.style.boxShadow=`0 0 0 3px ${C.brand}18`;}} onBlur={e=>{e.target.style.borderColor=C.g150;e.target.style.boxShadow="none";}}/>
                </div>
              </div>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, pointerEvents:"none" }}>🌐</span>
                <input id="domain_input" className="inp" value={domain} onChange={e=>setDomain(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canRun&&runFind()} placeholder="Domain or Company Name" style={{ width:"100%", padding:"10px 12px 10px 30px", borderRadius:8, fontSize:13, height:"42px", boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=C.brand;e.target.style.boxShadow=`0 0 0 3px ${C.brand}18`;}} onBlur={e=>{e.target.style.borderColor=C.g150;e.target.style.boxShadow="none";}}/>
              </div>
            </div>
            <div style={{ fontSize:9, color:C.g400, marginBottom:9 }}>Provide a domain <b>or</b> a company name along with the name.</div>
            <button onClick={runFind} disabled={!canRun||phase==="loading"||!canAfford('email')} style={{ width:"100%", background:C.brand, color:"#fff", border:"none", borderRadius:8, padding:"0 20px", height:"42px", boxSizing:"border-box", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, cursor:(canRun&&canAfford('email'))?"pointer":"not-allowed", opacity:(canRun&&canAfford('email'))?1:.42, boxShadow:`0 3px 12px ${C.brand}44`, transition:"all .18s" }}>
              {!canAfford('email') ? "Insufficient Credits 🪙" : (phase==="loading" ? "Finding email…" : "🔍 Find Email")}
            </button>
          </div>

          {phase==="loading"&&<div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"16px", flexShrink:0, display:"flex", alignItems:"center", gap:12 }}><div style={{ width:30, height:30, borderRadius:"50%", border:`3px solid ${C.g150}`, borderTopColor:C.brand, animation:"sp 1s linear infinite", flexShrink:0 }}/><div style={{ fontSize:12, color:C.g500 }}>Searching for the email address…</div></div>}

          {phase==="done"&&result&&(() => {
            const st = emailStatusStyle(result.found, result.status);
            const name = `${first.trim()} ${last.trim()}`.trim();
            const ref = domain.trim() || company.trim();
            return (
              <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 5px 24px rgba(57,83,251,.11)`, flexShrink:0 }}>
                <div style={{ height:3, background:`linear-gradient(90deg,${st.color},${st.color}99)` }}/>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:11, flexShrink:0, background:`linear-gradient(135deg,${C.brand},#6d28d9)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:15 }}>{getInitials(name)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:C.g800 }}>{name}</div>
                      <div style={{ fontSize:10, color:C.g400 }}>{ref}</div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:800, color:st.color, background:st.bg, border:`1px solid ${st.bd}`, borderRadius:20, padding:"3px 11px", flexShrink:0 }}>{st.label}</span>
                  </div>
                  {result.email ? (
                    <div style={{ display:"flex", alignItems:"center", gap:10, background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:9, padding:"11px 13px" }}>
                      <span style={{ fontSize:18 }}>✉️</span>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontSize:8, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:2 }}>Email Address</div>
                        <div style={{ fontSize:14, fontWeight:800, color:C.g800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{result.email}</div>
                      </div>
                      <button onClick={()=>navigator.clipboard?.writeText(result.email)} className="bs" style={{ borderRadius:7, padding:"6px 11px", fontSize:11, fontWeight:700, flexShrink:0 }}>⧉ Copy</button>
                    </div>
                  ) : (
                    <div style={{ fontSize:12, color:C.g500, background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:9, padding:"11px 13px" }}>No email could be found for this person.</div>
                  )}
                  {result.creditsCharged>0 && <div style={{ marginTop:10 }}><span className="cr-badge"><span>🪙</span><b>{result.creditsCharged} Credit{result.creditsCharged>1?"s":""}</b> used for this lookup</span></div>}
                </div>
              </div>
            );
          })()}

          {phase==="error"&&<div className="fi" style={{ background:C.reL, border:`1.5px solid ${C.reB}`, borderRadius:13, padding:"14px 16px", flexShrink:0, display:"flex", alignItems:"center", gap:10 }}><span style={{ fontSize:22 }}>⚠️</span><div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:800, color:C.re }}>{err}</div>{err.toLowerCase().includes("credit") && <button onClick={promptBuyCredits} className="bb" style={{ marginTop:8, borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700 }}>＋ Buy credits</button>}</div></div>}

          {phase==="idle"&&<div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, opacity:.4 }}><div style={{ fontSize:32 }}>✉️</div><div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:C.g500, textAlign:"center" }}>Enter a name and domain (or company) to find the email</div></div>}
        </div>
      )}

      {/* ── BULK ── */}
      {mode==="bulk" && bPhase==="idle" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, overflowY:"auto", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
            <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:11 }}>
              <CreditInfo toolKey="email" mode="bulk"/>
              <div className="uz" onClick={()=>fileRef.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);onFile(e.dataTransfer.files[0]);}} style={{ border:`2px dashed ${drag?C.brand:C.mid}`, borderRadius:11, padding:"22px 16px", textAlign:"center", cursor:"pointer", background:drag?C.lt:C.g50, transition:"all .2s" }}>
                <div style={{ fontSize:30, marginBottom:6 }}>📂</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:13, color:drag?C.brand:C.g800, marginBottom:4 }}>{drag?"Drop it!":"Drop CSV or TXT file here"}</div>
                <button className="bb" onClick={e=>{e.stopPropagation();fileRef.current.click();}} style={{ borderRadius:7, padding:"6px 16px", fontSize:11, fontWeight:700, marginBottom:4 }}>⬆ Upload file</button>
                <div style={{ fontSize:10, color:C.g400 }}>Each row: First, Last, Domain (or company)</div>
                <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display:"none" }} onChange={e=>onFile(e.target.files[0])}/>
              </div>
              {fname && <div style={{ fontSize:10, color:C.g500 }}>📄 {fname}</div>}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ flex:1, height:1, background:C.g150 }}/><span style={{ fontSize:10, color:C.g400, fontWeight:600 }}>or paste manually</span><div style={{ flex:1, height:1, background:C.g150 }}/></div>
              <textarea className="inp" rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder={"John, Doe, acme.com\nMia, Patel, Startup Inc\n…"} style={{ borderRadius:8, padding:"9px 11px", fontSize:11, fontFamily:"'Courier New',monospace", resize:"none", lineHeight:1.8, width:"100%" }}/>
              {text.trim() && <div style={{ fontSize:10, color:C.g500 }}><b>{parseEmailRows(text).length}</b> valid rows · est. up to <b>{parseEmailRows(text).length} credits</b> (1 per valid email found)</div>}
              {bErr && <div style={{ fontSize:11, fontWeight:700, color:C.re, background:C.reL, border:`1px solid ${C.reB}`, borderRadius:8, padding:"7px 11px" }}>{bErr}</div>}
              {(() => {
                const rowsCount = parseEmailRows(text).length;
                const isAffordable = canAfford('email', rowsCount);
                return (
                  <button onClick={runBulk} disabled={!rowsCount||!isAffordable} style={{ width:"100%", borderRadius:9, padding:"11px", fontSize:13, fontWeight:800, background:C.brand, color:"#fff", border:"none", cursor:(rowsCount&&isAffordable)?"pointer":"not-allowed", opacity:(rowsCount&&isAffordable)?1:.45, boxShadow:`0 3px 12px ${C.brand}44` }}>
                    {!isAffordable && rowsCount ? "Insufficient Credits 🪙" : "🔍 Find Emails"}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {mode==="bulk" && bPhase==="loading" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
            <div style={{ position:"relative", width:56, height:56, marginBottom:14 }}>
              <svg width="56" height="56" style={{ position:"absolute", inset:0 }}><circle cx="28" cy="28" r="23" fill="none" stroke={C.g150} strokeWidth="4"/></svg>
              <svg width="56" height="56" style={{ position:"absolute", inset:0 }}><circle cx="28" cy="28" r="23" fill="none" stroke={C.brand} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2*Math.PI*23*bProg/100} ${2*Math.PI*23}`} style={{ transform:"rotate(-90deg)", transformOrigin:"center", transition:"stroke-dasharray .15s" }}/></svg>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, color:C.brand }}>{bProg}%</div>
            </div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.g800, marginBottom:4 }}>Finding emails…</div>
            <div style={{ fontSize:11, color:C.g400 }}>Looking up each contact via Anymail Finder</div>
          </div>
        </div>
      )}

      {mode==="bulk" && bPhase==="done" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:8 }}>
          <div className="su" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, flexShrink:0 }}>
            {[{l:"Total",v:bCts.all,c:C.brand,bg:C.lt,bd:C.mid},{l:"Found",v:bCts.found,c:C.gr,bg:C.grL,bd:C.grB},{l:"Risky",v:bCts.risky,c:C.am,bg:C.amL,bd:C.amB},{l:"Not Found",v:bCts.notfound,c:C.re,bg:C.reL,bd:C.reB}].map(s=>(
              <div key={s.l} style={{ background:s.bg, border:`1.5px solid ${s.bd}`, borderRadius:11, padding:"10px 13px" }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:s.c, lineHeight:1, marginBottom:3 }}>{s.v}</div>
                <div style={{ fontSize:10, fontWeight:700, color:s.c, opacity:.75 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {bErr && <div style={{ fontSize:11, fontWeight:700, color:C.re, background:C.reL, border:`1px solid ${C.reB}`, borderRadius:8, padding:"7px 11px", flexShrink:0 }}>{bErr}</div>}
          <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:`linear-gradient(180deg,${C.g50},${C.w})`, flexWrap:"wrap", gap:5, flexShrink:0 }}>
              <div style={{ display:"flex", gap:5 }}>
                {[{id:"all",l:"All",cnt:bCts.all,ac:C.brand,ab:C.lt},{id:"found",l:"Found",cnt:bCts.found,ac:C.gr,ab:C.grL},{id:"risky",l:"Risky",cnt:bCts.risky,ac:C.am,ab:C.amL},{id:"notfound",l:"Not Found",cnt:bCts.notfound,ac:C.re,ab:C.reL}].map(f=>(
                  <button key={f.id} className="fb" onClick={()=>setBFilter(f.id)} style={{ padding:"4px 9px", borderRadius:6, fontSize:10, fontWeight:700, border:`1.5px solid ${bFilter===f.id?f.ac:C.g150}`, background:bFilter===f.id?f.ab:C.w, color:bFilter===f.id?f.ac:C.g400, transition:"all .14s" }}>{f.l} ({f.cnt})</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button className="bs" onClick={resetAll} style={{ fontSize:10, fontWeight:700, borderRadius:6, padding:"5px 10px" }}>↩ New List</button>
                {bRows.some(r => r.email) && (
                  <button
                    className="bb"
                    onClick={() => {
                      const foundEmails = bRows.map(r => r.email).filter(Boolean);
                      setPrefilledEmails(foundEmails.join("\n"));
                      onNav("validate");
                    }}
                    style={{
                      borderRadius: 6,
                      padding: "5px 11px",
                      fontSize: 10,
                      fontWeight: 700,
                      background: C.gr,
                      boxShadow: `0 2px 8px ${C.gr}28`
                    }}
                  >
                    ☑️ Validate Emails
                  </button>
                )}
                <ExportMenu up={false} columns={[{key:"name",label:"Name"},{key:"target",label:"Domain / Company"},{key:"email",label:"Email"},{key:"status",label:"Status"}]} rows={bRows.map(r=>({ name:`${r.first} ${r.last}`, target:r.domain||r.company, email:r.email||"", status:emailStatusStyle(r.found,r.status).label }))}/>
              </div>
            </div>
            <div style={{ flex:1, minHeight:0, overflow:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:420 }}>
                <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                  <tr style={{ background:C.g50 }}>
                    {["Name","Domain / Company","Email","Status"].map(h=>(
                      <th key={h} style={{ padding:"7px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visRows.map((r,i)=>{ const st=emailStatusStyle(r.found,r.status); return (
                    <tr key={i} className="tr" style={{ background:i%2===0?C.w:C.g50 }}>
                      <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:700, color:C.g800, whiteSpace:"nowrap" }}>{r.first} {r.last}</td>
                      <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, color:C.g600||C.g500, whiteSpace:"nowrap" }}>{r.domain||r.company}</td>
                      <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:600, color:r.email?C.g800:C.g300, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:200 }}>{r.email||"—"}</td>
                      <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}><span style={{ fontSize:9, fontWeight:700, color:st.color, background:st.bg, border:`1px solid ${st.bd}`, borderRadius:5, padding:"2px 7px" }}>{st.label}</span></td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
            <div style={{ padding:"7px 14px", borderTop:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`linear-gradient(180deg,${C.w},${C.g50})`, flexShrink:0 }}>
              <span style={{ fontSize:10, color:C.g400 }}>Showing <b style={{ color:C.g700 }}>{visRows.length}</b> of <b style={{ color:C.g700 }}>{bCts.all}</b></span>
              <span style={{ fontSize:10, color:C.gr, fontWeight:800 }}>{bCts.found} emails found</span>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {mode==="history" && (
        <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1, minHeight:0, overflowY:"auto", paddingRight:2 }}>
          {historyItemDetails ? (
            <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1 }}>
              <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"12px 16px", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <button className="bs" onClick={() => setHistoryItemDetails(null)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700 }}>
                    ← Back to Jobs
                  </button>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:C.g800 }}>
                    📁 {historyItemDetails.jobName || (historyItemDetails.processingType === "bulk" ? "Bulk Run" : "Single Run")}
                  </span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:historyItemDetails.processingType==="bulk"?C.brand:C.gr, background:historyItemDetails.processingType==="bulk"?C.lt:C.grL, border:`1px solid ${historyItemDetails.processingType==="bulk"?C.mid:C.grB}`, borderRadius:20, padding:"2px 8px" }}>
                    {historyItemDetails.processingType}
                  </span>
                  <span style={{ fontSize:11, color:C.g500, fontWeight:600 }}>
                    {formatJobDate(historyItemDetails.createdAt)}
                  </span>
                </div>
              </div>

              {historyItemDetails.processingType === "single" ? (
                historyItemDetails.records && historyItemDetails.records[0] && historyItemDetails.records[0].output ? (
                  (() => {
                    const r = historyItemDetails.records[0].output || {};
                    const st = emailStatusStyle(r.found, r.status);
                    const name = `${r.first || ""} ${r.last || ""}`.trim();
                    const ref = r.domain || r.company || "";
                    return (
                      <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 5px 24px rgba(57,83,251,.11)`, flexShrink:0 }}>
                        <div style={{ height:3, background:`linear-gradient(90deg,${st.color},${st.color}99)` }}/>
                        <div style={{ padding:"14px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:12 }}>
                            <div style={{ width:40, height:40, borderRadius:11, flexShrink:0, background:`linear-gradient(135deg,${C.brand},#6d28d9)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:15 }}>{getInitials(name)}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:C.g800 }}>{name}</div>
                              <div style={{ fontSize:10, color:C.g400 }}>{ref}</div>
                            </div>
                            <span style={{ fontSize:10, fontWeight:800, color:st.color, background:st.bg, border:`1px solid ${st.bd}`, borderRadius:20, padding:"3px 11px", flexShrink:0 }}>{st.label}</span>
                          </div>
                          {r.email ? (
                            <div style={{ display:"flex", alignItems:"center", gap:10, background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:9, padding:"11px 13px" }}>
                              <span style={{ fontSize:18 }}>✉️</span>
                              <div style={{ minWidth:0, flex:1 }}>
                                <div style={{ fontSize:8, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:2 }}>Email Address</div>
                                <div style={{ fontSize:14, fontWeight:800, color:C.g800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.email}</div>
                              </div>
                              <button onClick={()=>navigator.clipboard?.writeText(r.email)} className="bs" style={{ borderRadius:7, padding:"6px 11px", fontSize:11, fontWeight:700, flexShrink:0 }}>⧉ Copy</button>
                            </div>
                          ) : (
                            <div style={{ fontSize:12, color:C.g500, background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:9, padding:"11px 13px" }}>No email could be found for this person.</div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", textAlign:"center", color:C.re }}>
                    Failed record: {historyItemDetails.records && historyItemDetails.records[0] ? historyItemDetails.records[0].error : "No output details available"}
                  </div>
                )
              ) : (
                (() => {
                  const records = historyItemDetails.records || [];
                  const rows = records.map(rec => rec.output).filter(Boolean);
                  const cts = {
                    all: rows.length,
                    found: rows.filter(r => r.found).length,
                    risky: rows.filter(r => !r.found && String(r.status).toLowerCase() === "risky").length,
                    notfound: rows.filter(r => !r.found && String(r.status).toLowerCase() !== "risky").length
                  };
                  const vis = bFilter === "all" ? rows
                    : bFilter === "found" ? rows.filter(r => r.found)
                    : bFilter === "risky" ? rows.filter(r => !r.found && String(r.status).toLowerCase() === "risky")
                    : rows.filter(r => !r.found && String(r.status).toLowerCase() !== "risky");

                  return (
                    <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1, minHeight:0 }}>
                      <div className="su" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, flexShrink:0 }}>
                        {[
                          { l:"Total",    v:cts.all,      c:C.brand, bg:C.lt,  bd:C.mid  },
                          { l:"Found",    v:cts.found,    c:C.gr,    bg:C.grL, bd:C.grB  },
                          { l:"Risky",    v:cts.risky,    c:C.am,    bg:C.amL, bd:C.amB  },
                          { l:"Not Found",v:cts.notfound, c:C.re,    bg:C.reL, bd:C.reB  },
                        ].map(s => (
                          <div key={s.l} style={{ background:s.bg, border:`1.5px solid ${s.bd}`, borderRadius:11, padding:"10px 13px" }}>
                            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:s.c, lineHeight:1, marginBottom:3 }}>{s.v}</div>
                            <div style={{ fontSize:10, fontWeight:700, color:s.c, opacity:.75 }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:`linear-gradient(180deg,${C.g50},${C.w})`, flexWrap:"wrap", gap:5, flexShrink:0 }}>
                          <div style={{ display:"flex", gap:5 }}>
                            {[
                              { id:"all",      l:"All",       cnt:cts.all,      ac:C.brand, ab:C.lt  },
                              { id:"found",    l:"Found",     cnt:cts.found,    ac:C.gr,    ab:C.grL },
                              { id:"risky",    l:"Risky",     cnt:cts.risky,    ac:C.am,    ab:C.amL },
                              { id:"notfound", l:"Not Found", cnt:cts.notfound, ac:C.re,    ab:C.reL },
                            ].map(f => (
                              <button key={f.id} className="fb" onClick={() => setBFilter(f.id)} style={{ padding:"4px 9px", borderRadius:6, fontSize:10, fontWeight:700, border:`1.5px solid ${bFilter===f.id?f.ac:C.g150}`, background:bFilter===f.id?f.ab:C.w, color:bFilter===f.id?f.ac:C.g400, transition:"all .14s" }}>{f.l} ({f.cnt})</button>
                            ))}
                          </div>
                          <div style={{ display:"flex", gap:6 }}>
                            {rows.some(r => r.email) && (
                              <button
                                className="bb"
                                onClick={() => {
                                  const foundEmails = rows.map(r => r.email).filter(Boolean);
                                  setPrefilledEmails(foundEmails.join("\n"));
                                  onNav("validate");
                                }}
                                style={{
                                  borderRadius: 6,
                                  padding: "5px 11px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: C.gr,
                                  boxShadow: `0 2px 8px ${C.gr}28`
                                }}
                              >
                                ☑️ Validate Emails
                              </button>
                            )}
                            <ExportMenu up={false} {...getExportPropsForJob(historyItemDetails)} />
                          </div>
                        </div>
                        <div style={{ flex:1, minHeight:0, overflow:"auto" }}>
                          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:420 }}>
                            <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                              <tr style={{ background:C.g50 }}>
                                {["Name","Domain / Company","Email","Status"].map(h=>(
                                  <th key={h} style={{ padding:"7px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                               {vis.map((r,i)=>{
                                 const st=emailStatusStyle(r.found,r.status);
                                 const rowId = `record_row_${(r.email || `${r.first}_${r.last}`).replace(/[^a-zA-Z0-9]/g, '_')}`;
                                 const matchesHighlight = highlightVal && (
                                   (r.email && r.email.toLowerCase().includes(highlightVal.toLowerCase())) ||
                                   (r.first && r.first.toLowerCase().includes(highlightVal.toLowerCase())) ||
                                   (r.last && r.last.toLowerCase().includes(highlightVal.toLowerCase()))
                                 );
                                 return (
                                   <tr key={i} id={rowId} className="tr" style={{ background: matchesHighlight ? "rgba(251, 191, 36, 0.25)" : (i%2===0?C.w:C.g50) }}>
                                     <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:700, color:C.g800, whiteSpace:"nowrap" }}>{r.first} {r.last}</td>
                                     <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, color:C.g600, whiteSpace:"nowrap" }}>{r.domain||r.company}</td>
                                     <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:600, color:r.email?C.g800:C.g300, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:200 }}>{r.email||"—"}</td>
                                     <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}><span style={{ fontSize:9, fontWeight:700, color:st.color, background:st.bg, border:`1px solid ${st.bd}`, borderRadius:5, padding:"2px 7px" }}>{st.label}</span></td>
                                   </tr>
                                 );
                               })}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ padding:"7px 14px", borderTop:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`linear-gradient(180deg,${C.w},${C.g50})`, flexShrink:0 }}>
                          <span style={{ fontSize:10, color:C.g400 }}>Showing <b style={{ color:C.g700 }}>{vis.length}</b> of <b style={{ color:C.g700 }}>{cts.all}</b></span>
                          <span style={{ fontSize:10, color:C.gr, fontWeight:800 }}>{cts.found} emails found</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1 }}>
              {historiesLoading ? (
                <div style={{ display:"flex", flex:1, alignItems:"center", justifyContent:"center", padding:40, color:C.g400, fontWeight:700, fontSize:13 }}>
                  Loading jobs…
                </div>
              ) : histories.length === 0 ? (
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, opacity:.4, padding:40 }}>
                  <div style={{ fontSize:32 }}>📜</div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:C.g500, textAlign:"center" }}>No email finder jobs found.</div>
                </div>
              ) : (
                <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flex:1, display:"flex", flexDirection:"column" }}>
                  {/* Search Bar */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:`1px solid ${C.g150}`, background:C.g50 }}>
                    <span>🔍</span>
                    <input
                      type="text"
                      value={jobQuery}
                      onChange={(e) => setJobQuery(e.target.value)}
                      placeholder="Search jobs by name..."
                      style={{
                        flex: 1,
                        border: "none",
                        background: "transparent",
                        fontSize: 12,
                        fontWeight: 500,
                        color: C.g800,
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                    {jobQuery && (
                      <button
                        onClick={() => setJobQuery("")}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: 10,
                          color: C.g400,
                          fontWeight: 800,
                          padding: "2px 6px"
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {selectedIds.size > 0 && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:C.reL, transition:"all .2s" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:C.re }}>{selectedIds.size} items selected</span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <ExportMenu
                          up={false}
                          columns={exportColumns}
                          rows={getExportDataForItems(histories.filter(h => selectedIds.has(h._id)))}
                          label="Export Selected"
                          style={{ display: "inline-block" }}
                          buttonStyle={{
                            background: C.brand,
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 12px",
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        />
                        <button onClick={handleBulkDelete} style={{ background:C.re, color:"#fff", border:"none", borderRadius:6, padding:"5px 12px", fontSize:10, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                          🗑️ Delete Selected
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ flex:1, overflowY:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
                      <thead style={{ position:"sticky", top:0, zIndex:1, background:C.g50 }}>
                        <tr>
                          <th style={{ padding:"9px 13px", width:36, borderBottom:`1.5px solid ${C.g150}`, textAlign:"left" }}>
                            <input
                              type="checkbox"
                              checked={filteredHistories.length > 0 && Array.from(selectedIds).filter(id => filteredHistories.some(fh => fh._id === id)).length === filteredHistories.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(prev => {
                                    const next = new Set(prev);
                                    filteredHistories.forEach(fh => next.add(fh._id));
                                    return next;
                                  });
                                } else {
                                  setSelectedIds(prev => {
                                    const next = new Set(prev);
                                    filteredHistories.forEach(fh => next.delete(fh._id));
                                    return next;
                                  });
                                }
                              }}
                              style={{ cursor:"pointer", verticalAlign:"middle" }}
                            />
                          </th>
                          {["Date / Time","Type","Input Value / Preview","Action"].map(h=>(
                            <th key={h} style={{ padding:"9px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistories.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding:"24px", textAlign:"center", color:C.g400, fontSize:12, fontWeight:600 }}>
                              No matching jobs found.
                            </td>
                          </tr>
                        ) : (
                          filteredHistories.map((item, i) => {
                            const isBulk = item.processingType === "bulk";
                            const displayName = item.jobName || (isBulk 
                              ? `Bulk Run (${item.records?.length || 0} records)` 
                              : (item.records && item.records[0] ? item.records[0].inputVal : "—"));
                            const preview = isBulk ? `📁 ${displayName}` : displayName;
                            return (
                              <tr key={item._id} className="tr" style={{ background:i%2===0?C.w:C.g50 }}>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, width:36 }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.has(item._id)}
                                    onChange={() => handleToggleSelect(item._id)}
                                    style={{ cursor:"pointer", verticalAlign:"middle" }}
                                  />
                                </td>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:600, color:C.g700, whiteSpace:"nowrap" }}>
                                  {formatJobDate(item.createdAt)}
                                </td>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                  <span style={{ fontSize:9, fontWeight:700, color:isBulk?C.brand:C.gr, background:isBulk?C.lt:C.grL, border:`1px solid ${isBulk?C.mid:C.grB}`, borderRadius:5, padding:"2px 7px", whiteSpace:"nowrap", textTransform:"capitalize" }}>
                                    {item.processingType}
                                  </span>
                                </td>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:700, color:C.g800, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {preview}
                                </td>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                                    <button className="bb" onClick={() => loadHistoryItemDetails(item._id)} style={{ padding:"4px 10px", borderRadius:6, fontSize:10, fontWeight:800, background:C.brand, color:"#fff", border:"none", cursor:"pointer" }}>
                                      View Results
                                    </button>
                                    <ExportMenu
                                      up={false}
                                      {...getExportPropsForJob(item)}
                                      label="Export"
                                      style={{ display: "inline-block" }}
                                      buttonStyle={{
                                        background: "transparent",
                                        border: `1px solid ${C.mid}`,
                                        color: C.brand,
                                        borderRadius: 6,
                                        padding: "4px 8px",
                                        fontSize: 10,
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        transition: "all .15s",
                                      }}
                                    />
                                    <button onClick={() => handleDeleteSingle(item._id)} style={{ background:"transparent", border:`1px solid ${C.reB}`, color:C.re, borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:800, cursor:"pointer", transition:"all .15s" }} onMouseEnter={e => {e.target.style.background=C.reL;}} onMouseLeave={e => {e.target.style.background="transparent";}}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   2. PHONE NUMBER FINDER
═══════════════════════════════════════════════════ */
function PhoneFinder() {
  const { balance, spend, canAfford } = useCredits();
  const [mode,setMode]   = useState("single");
  const [val,setVal]     = useState("");
  const [phase,setPhase] = useState("idle");
  const [modal,setModal] = useState(false); const [sel,setSel] = useState([]);
  const [bStep,setBStep] = useState(0); const [bProg,setBProg] = useState(0); const [bSel,setBSel] = useState([]); const [bMod,setBMod] = useState(false);
  const [drag,setDrag]   = useState(false); const [fname,setFname] = useState("");
  const [err,setErr]     = useState(""); const [bErr,setBErr] = useState("");
  const fileRef = useRef(); const inputRef = useRef();
  useEffect(()=>{if(mode==="single")inputRef.current?.focus();},[mode]);

  const runBulk = async (c) => {
    setBSel(c);
    setBMod(false);
    setBStep(1);
    setBProg(0);
    setBErr("");
    const totalCost = BULK_ROWS.length * COSTS.phone;
    try {
      await spend('phone', totalCost);
      const iv=setInterval(()=>{setBProg(p=>{const n=Math.min(p+Math.random()*4+1.5,100);if(n>=100){clearInterval(iv);setBStep(2);}return n;});},80);
    } catch (err) {
      setBStep(0);
      setBErr(err.message || "Out of credits");
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"#fff1f2", border:"1.5px solid #fecdd3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📞</div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:C.g800 }}>Phone Number Finder</div>
            <div style={{ fontSize:10, color:C.g400 }}>Enter LinkedIn URL → get phone number & more</div>
          </div>
        </div>
        <ModeToggle mode={mode} onChange={m=>{setMode(m);setPhase("idle");setVal("");setSel([]);setBStep(0);setBProg(0);setFname("");}}/>
      </div>

      {mode==="single" && (
        <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1, minHeight:0 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flexShrink:0 }}>
            <div style={{ marginBottom:12 }}><CreditInfo toolKey="phone" mode="single"/></div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1, position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:10, color:C.li, fontWeight:900, fontFamily:"serif", pointerEvents:"none" }}>in</span>
                <input id="phone_linkedin_input" ref={inputRef} className="inp" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&val.trim()&&canAfford('phone')&&setModal(true)} placeholder="e.g. linkedin.com/in/sarah-chen-sales" style={{ width:"100%", padding:"10px 12px 10px 30px", borderRadius:8, fontSize:13, height:"42px", boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=C.li;e.target.style.boxShadow=`0 0 0 3px ${C.li}18`;}} onBlur={e=>{e.target.style.borderColor=C.g150;e.target.style.boxShadow="none";}}/>
              </div>
              <button onClick={()=>val.trim()&&setModal(true)} disabled={!val.trim()||phase==="loading"||!canAfford('phone')} style={{ background:"#e11d48", color:"#fff", border:"none", borderRadius:8, padding:"0 20px", height:"42px", boxSizing:"border-box", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, cursor:(val.trim()&&canAfford('phone'))?"pointer":"not-allowed", opacity:(val.trim()&&canAfford('phone'))?1:.42, boxShadow:"0 3px 12px #e11d4844", whiteSpace:"nowrap", transition:"all .18s" }}>
                {!canAfford('phone') ? "Insufficient Credits 🪙" : "Next →"}
              </button>
            </div>
            {sel.length>0&&phase!=="idle"&&(
              <div className="fi" style={{ marginTop:9, paddingTop:9, borderTop:`1px solid ${C.g150}`, display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ fontSize:9, color:C.g400, fontWeight:700 }}>Generating:</span>
                {sel.map(id=>{const f=PF_FIELDS.find(x=>x.id===id);return f?<span key={id} style={{ fontSize:9, fontWeight:700, color:"#e11d48", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:20, padding:"2px 7px" }}>{f.icon} {f.label}</span>:null;})}
                <button onClick={()=>setModal(true)} style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color:C.brand, background:C.lt, border:`1px solid ${C.mid}`, borderRadius:6, padding:"2px 8px", cursor:"pointer" }}>✎ Edit</button>
              </div>
            )}
          </div>
          {phase==="loading"&&<div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", flexShrink:0 }}><div style={{ display:"flex", gap:11, marginBottom:10 }}><div className="bone" style={{ width:40, height:40, borderRadius:11, flexShrink:0 }}/><div style={{ flex:1 }}><div className="bone" style={{ width:"50%", height:14, marginBottom:6 }}/><div className="bone" style={{ width:"68%", height:11 }}/></div></div><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:7 }}>{Array(Math.min(sel.length||4,4)).fill(0).map((_,i)=><div key={i} className="bone" style={{ height:44, borderRadius:8 }}/>)}</div></div>}
          {phase==="done"&&<ResultCard sel={sel} fields={PF_FIELDS} creditsUsed={CREDITS.phone.cost}/>}
          {phase==="error"&&<div className="fi" style={{ background:C.reL, border:`1.5px solid ${C.reB}`, borderRadius:13, padding:"14px 16px", flexShrink:0, display:"flex", alignItems:"center", gap:10 }}><span style={{ fontSize:22 }}>⚠️</span><div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:800, color:C.re }}>{err}</div>{err.toLowerCase().includes("credit") && <button onClick={promptBuyCredits} className="bb" style={{ marginTop:8, borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700 }}>＋ Buy credits</button>}</div></div>}
          {phase==="idle"&&<div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, opacity:.4 }}><div style={{ fontSize:32 }}>📞</div><div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:C.g500, textAlign:"center" }}>Enter a LinkedIn profile URL above</div></div>}
        </div>
      )}

      {mode==="bulk" && bStep===0 && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
          <BulkUploadCard title="Bulk Phone Number Finder" hint="One LinkedIn URL per line · up to 50,000 records" phText={"linkedin.com/in/sarah-chen\nlinkedin.com/in/john-doe\n…"} onNext={()=>setBMod(true)} drag={drag} setDrag={setDrag} fname={fname} setFname={setFname} fileRef={fileRef} toolKey="phone"/>
          {bErr && <div style={{ fontSize:11, fontWeight:700, color:C.re, background:C.reL, border:`1px solid ${C.reB}`, borderRadius:8, padding:"7px 11px", margin: "0 16px" }}>{bErr}</div>}
        </div>
      )}
      {mode==="bulk" && bStep===1 && <BulkLoading prog={bProg} bSel={bSel} fields={PF_FIELDS}/>}
      {mode==="bulk" && bStep===2 && <BulkTable bSel={bSel} fields={PF_FIELDS} colKeys={PF_COL} creditsPerRecord={CREDITS.phone.cost} unitLabel="Phone Numbers"/>}

      {modal && <FieldModal fields={PF_FIELDS} onClose={()=>setModal(false)} onConfirm={async c=>{
        setSel(c);
        setModal(false);
        setPhase("loading");
        setErr("");
        try {
          await spend('phone');
          setTimeout(()=>setPhase("done"),1800);
        } catch (e) {
          setErr(e.message || "Deduction failed");
          setPhase("error");
        }
      }} initial={sel}/>}
      {bMod  && <FieldModal fields={PF_FIELDS} onClose={()=>setBMod(false)} onConfirm={runBulk} initial={bSel}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   3. LINKEDIN ENRICHMENT
═══════════════════════════════════════════════════ */
// Input detection for LinkedIn Enrichment (email vs LinkedIn URL).
const LI_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LI_URL_RE = /linkedin\.com\/(in|company)\//i;
const liInputKind = (v) => {
  const s = (v || "").trim();
  if (LI_EMAIL_RE.test(s)) return "email";
  if (LI_URL_RE.test(s)) return "url";
  return null;
};

// LinkedIn Enrichment field-selection (spec keys).
const LI_SELECT_FIELDS_PERSON = [
  { key:"fullName", label:"Full Name", icon:"👤" },
  { key:"headline", label:"Headline", icon:"💬" },
  { key:"type", label:"Type", icon:"🏷" },
  { key:"company", label:"Company", icon:"🏢" },
  { key:"location", label:"Location", icon:"📍" },
  { key:"industry", label:"Industry", icon:"🏭" },
  { key:"jobTitle", label:"Job Title", icon:"💼" },
  { key:"email", label:"Email", icon:"✉" },
  { key:"skills", label:"Skills", icon:"🛠" },
  { key:"workHistory", label:"Work History", icon:"📜" },
  { key:"education", label:"Education", icon:"🎓" },
  { key:"companyDomain", label:"Company Domain / Website", icon:"🌐" },
];
const LI_SELECT_FIELDS_COMPANY = [
  { key:"fullName", label:"Name", icon:"🏢" },
  { key:"headline", label:"Headline", icon:"💬" },
  { key:"type", label:"Type", icon:"🏷" },
  { key:"company", label:"Company", icon:"🏢" },
  { key:"location", label:"Location", icon:"📍" },
  { key:"industry", label:"Industry", icon:"🏭" },
  { key:"jobTitle", label:"Job Title", icon:"💼" },
  { key:"email", label:"Email", icon:"✉" },
  { key:"skills", label:"Skills", icon:"🛠" },
  { key:"workHistory", label:"Work History", icon:"📜" },
  { key:"education", label:"Education", icon:"🎓" },
  { key:"companyDomain", label:"Company Domain / Website", icon:"🌐" },
];

function LinkedInFieldModal({ kind="person", cost=5, onClose, onGenerate }) {
  const F = kind === "company" ? LI_SELECT_FIELDS_COMPANY : LI_SELECT_FIELDS_PERSON;
  const [sel, setSel] = useState(() => Object.fromEntries(F.map(x => [x.key, x.key === "fullName" || x.key === "company"])));
  const [jobName, setJobName] = useState("");
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const keys = Object.keys(sel).filter(k => sel[k]);
  const canGen = keys.length > 0;
  const selectAll = () => setSel(Object.fromEntries(F.map(x => [x.key, true])));
  const deselectAll = () => setSel(Object.fromEntries(F.map(x => [x.key, false])));
  const toggle = (k) => setSel(p => ({ ...p, [k]: !p[k] }));
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,23,42,.55)", backdropFilter:"blur(3px)", padding:16 }} onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
      <div style={{ width:"100%", maxWidth:560, background:C.w, borderRadius:18, overflow:"hidden", boxShadow:"0 24px 64px -12px rgba(16,24,64,.45)", maxHeight:"88vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px", borderBottom:`1px solid ${C.g100}` }}>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:800, color:C.g800 }}>Select Fields</div>
            <div style={{ marginTop:3, fontSize:11, color:C.g400 }}>No credits used until Generate.</div>
          </div>
          <button onClick={onClose} style={{ border:"none", background:"transparent", cursor:"pointer", fontSize:18, color:C.g400, borderRadius:8, padding:"4px 8px", lineHeight:1 }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:12 }}>
          {/* Job Name Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.g700 }}>Job Name (Optional)</label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g. Lead Generation – US Tech"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                border: `1.5px solid ${C.g150}`,
                outline: "none",
                fontFamily: "inherit"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = C.brand;
                e.target.style.boxShadow = `0 0 0 3px ${C.brand}18`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.g150;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", borderTop:`1px solid ${C.g100}`, paddingTop:10 }}>
            <button onClick={selectAll} style={{ borderRadius:9, border:`1.5px solid ${C.g150}`, background:C.w, padding:"7px 10px", fontSize:11, fontWeight:800, color:C.g700, cursor:"pointer" }}>Select all</button>
            <button onClick={deselectAll} style={{ borderRadius:9, border:`1.5px solid ${C.g150}`, background:C.w, padding:"7px 10px", fontSize:11, fontWeight:800, color:C.g700, cursor:"pointer" }}>Deselect all</button>
            <span style={{ marginLeft:"auto", fontSize:11, fontWeight:800, color:C.g400 }}>{keys.length} selected</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {F.map(({key,label,icon}) => {
              const on = !!sel[key];
              return (
                <button key={key} onClick={()=>toggle(key)} style={{ display:"flex", alignItems:"center", gap:8, textAlign:"left", cursor:"pointer", borderRadius:11, padding:"9px 11px", fontSize:12, fontWeight:600, transition:"all .15s", border:`1.5px solid ${on?C.mid:C.g150}`, background:on?C.lt:C.w, color:on?C.brand:C.g500 }}>
                  <span style={{ fontSize:14 }}>{icon}</span>
                  <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{label}</span>
                  {on && <span style={{ color:C.brand, fontWeight:900 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", borderTop:`1px solid ${C.g100}` }}>
          <span style={{ fontSize:11, color:C.g400 }}>Cost: <b style={{ color:C.g700 }}>{cost}</b> credits</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onClose} style={{ borderRadius:9, border:"none", background:"transparent", padding:"9px 16px", fontSize:12, fontWeight:700, color:C.g500, cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>onGenerate?.(keys, jobName)} disabled={!canGen} style={{ fontFamily:"'Sora',sans-serif", borderRadius:9, border:"none", padding:"9px 18px", fontSize:12, fontWeight:800, color:"#fff", background:C.brand, cursor:!canGen?"not-allowed":"pointer", opacity:!canGen?.4:1 }}>Generate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FIELD_META_MAP = {
  fullName: { key: "fullName", label: "Name" },
  headline: { key: "headline", label: "Headline" },
  type: { key: "type", label: "Type" },
  company: { key: "company", label: "Company" },
  location: { key: "location", label: "Location" },
  industry: { key: "industry", label: "Industry" },
  jobTitle: { key: "jobTitle", label: "Job Title" },
  email: { key: "email", label: "Email" },
  skills: { key: "skills", label: "Skills" },
  workHistory: { key: "jobHistory", label: "Work History" },
  education: { key: "education", label: "Education" },
  companyDomain: { key: "companyDomain", label: "Company Domain / Website" }
};

function LinkedInProfileCard({ p, fields, isBulk, creditsUsed }) {
  const copy = (t) => navigator.clipboard?.writeText(t);
  const displayName = p.fullName || "Profile";
  const initials = getInitials(displayName);
  const liYear = (s) => { if (!s) return null; const d = new Date(s); return isNaN(d) ? null : d.getFullYear(); };
  const liRange = (a, b) => { const s = liYear(a); const e = b ? liYear(b) : "Present"; if (!s && !b) return ""; return s ? `${s} – ${e}` : (e || ""); };

  const activeFields = (isBulk && fields && fields.length > 0) ? fields : null;

  let gridItems = [];
  if (activeFields) {
    activeFields.forEach(f => {
      if (f === "email") {
        gridItems.push({ icon: "✉", label: "Email", val: p.email || "Email Not Found" });
      } else if (f === "company") {
        if (p.company) gridItems.push({ icon: "🏢", label: "Company", val: p.company });
      } else if (f === "location") {
        if (p.location) gridItems.push({ icon: "📍", label: "Location", val: p.location });
      } else if (f === "industry") {
        if (p.industry) gridItems.push({ icon: "📊", label: "Industry", val: p.industry });
      } else if (f === "jobTitle") {
        if (p.jobTitle) gridItems.push({ icon: "💼", label: "Job Title", val: p.jobTitle });
      } else if (f === "companyDomain") {
        if (p.companyDomain || p.website) gridItems.push({ icon: "🌐", label: "Company Domain / Website", val: p.companyDomain || p.website });
      } else if (f === "type") {
        if (p.type) gridItems.push({ icon: "🏷", label: "Type", val: p.type });
      } else if (f === "headline") {
        const hl = p.headline || (p.raw && p.raw.headline);
        if (hl) gridItems.push({ icon: "💬", label: "Headline", val: hl });
      }
    });
  } else {
    gridItems = [
      p.company ? { icon: "🏢", label: "Company", val: p.company } : null,
      p.location ? { icon: "📍", label: "Location", val: p.location } : null,
      p.industry ? { icon: "📊", label: "Industry", val: p.industry } : null,
      p.jobTitle ? { icon: "💼", label: "Job Title", val: p.jobTitle } : null,
      p.email ? { icon: "✉", label: "Email", val: p.email } : null,
      p.website ? { icon: "🌐", label: "Website", val: p.website } : null,
      p.companyDomain ? { icon: "🌐", label: "Company Domain / Website", val: p.companyDomain } : null,
      p.staffTotal ? { icon: "👥", label: "Staff", val: String(p.staffTotal) } : null,
    ].filter(Boolean);
  }

  const bottomSections = activeFields
    ? activeFields.filter(f => ["skills", "workHistory", "education"].includes(f))
    : ["skills", "workHistory", "education"];

  let exportCols = [];
  let exportRows = [];

  if (activeFields) {
    exportCols = activeFields.map(f => {
      if (f === "workHistory") return { key: "jobHistory", label: "Work History" };
      return FIELD_META_MAP[f] || { key: f, label: f };
    });
    exportRows = [{
      fullName: (p.fullName || "").replace(/\s+/g, ' ').trim(),
      type: p.type || "",
      jobTitle: p.jobTitle || "",
      company: p.company || "",
      email: p.email || (activeFields.includes("email") ? "Email Not Found" : ""),
      location: p.location || "",
      industry: p.industry || "",
      website: p.website || "",
      companyDomain: p.companyDomain || p.website || "",
      staff: (p.headcount ?? p.staffTotal) || "",
      linkedinUrl: p.linkedinUrl || "",
      skills: (p.skills || []).join("; "),
      jobHistory: (p.jobHistory || []).map(j => `${[j.title, j.company].filter(Boolean).join(" at ")}${j.start ? ` (${liYear(j.start)}–${j.end ? liYear(j.end) : "Present"})` : ""}`).join(" | "),
      education: (p.education || []).map(e => [[e.degree, e.field].filter(Boolean).join(" in "), e.school].filter(Boolean).join(", ")).join(" | "),
      headline: p.headline || (p.raw && p.raw.headline) || "",
    }];
  } else {
    exportRows = [{
      fullName: p.fullName, type: p.type, jobTitle: p.jobTitle, company: p.company,
      email: p.email || "",
      location: p.location, industry: p.industry, website: p.website || "",
      companyDomain: p.companyDomain || p.website || "",
      staff: (p.headcount ?? p.staffTotal) || "", linkedinUrl: p.linkedinUrl,
      skills: (p.skills || []).join("; "),
      jobHistory: (p.jobHistory || []).map(j => `${[j.title, j.company].filter(Boolean).join(" at ")}${j.start ? ` (${liYear(j.start)}–${j.end ? liYear(j.end) : "Present"})` : ""}`).join(" | "),
      education: (p.education || []).map(e => [[e.degree, e.field].filter(Boolean).join(" in "), e.school].filter(Boolean).join(", ")).join(" | "),
    }];
    exportCols = [
      { key:"fullName", label:"Name" }, { key:"type", label:"Type" }, { key:"jobTitle", label:"Job Title" },
      { key:"company", label:"Company" }, { key:"email", label:"Email" }, { key:"location", label:"Location" }, { key:"industry", label:"Industry" },
      { key:"website", label:"Website" }, { key:"companyDomain", label:"Company Domain / Website" }, { key:"staff", label:"Staff" }, { key:"linkedinUrl", label:"LinkedIn URL" },
      { key:"skills", label:"Skills" }, { key:"jobHistory", label:"Work History" }, { key:"education", label:"Education" },
    ];
  }

  const handleCopyAll = () => {
    let copyObj = { ...p };
    if (isBulk && fields && fields.includes("email") && !copyObj.email) {
      copyObj.email = "Email Not Found";
    }
    copy(JSON.stringify(copyObj, null, 2));
  };

  return (
    <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 5px 24px rgba(57,83,251,.11)`, flexShrink:0 }}>
      <div style={{ height:3, background:`linear-gradient(90deg,${C.li},#4f9fe0,${C.li})` }}/>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          {p.photo
            ? <img src={p.photo} alt="" style={{ width:46, height:46, borderRadius:12, objectFit:"cover", flexShrink:0, border:`1.5px solid ${C.g150}` }} onError={e=>{e.target.style.display="none";}}/>
            : <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg,${C.li},#1d4ed8)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:16 }}>{initials}</div>}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.g800 }}>{displayName}</span>
              {p.type && <span style={{ fontSize:9, fontWeight:700, color:C.li, background:"#dbeafe", border:"1px solid #93c5fd", borderRadius:20, padding:"2px 8px", textTransform:"capitalize" }}>{p.type}</span>}
            </div>
            <div style={{ fontSize:11, color:C.g500, fontWeight:600, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{[p.jobTitle, p.company].filter(Boolean).join(" · ") || "—"}</div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:7, marginBottom:10 }}>
          {gridItems.map(f => (
            <div key={f.label} style={{ background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:8, padding:"8px 10px", display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:26, height:26, borderRadius:7, flexShrink:0, background:"#dbeafe", border:"1px solid #93c5fd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{f.icon}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:8, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:1 }}>{f.label}</div>
                <div style={{ fontSize:11, fontWeight:700, color:C.g800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.val || "—"}</div>
              </div>
            </div>
          ))}
        </div>

        {bottomSections.map(sec => {
          if (sec === "skills" && p.skills && p.skills.length > 0) {
            return (
              <div key="skills" style={{ marginBottom:10 }}>
                <div style={{ fontSize:8, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5 }}>Skills</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {p.skills.slice(0,14).map((s,i)=><span key={i} style={{ fontSize:9, fontWeight:700, color:C.li, background:"#dbeafe", border:"1px solid #93c5fd", borderRadius:20, padding:"2px 8px" }}>{s}</span>)}
                </div>
              </div>
            );
          }
          if (sec === "workHistory" && (p.jobHistory || []).length > 0) {
            return (
              <div key="workHistory" style={{ marginBottom:10 }}>
                <div style={{ fontSize:8, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5 }}>Work History</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {(p.jobHistory || []).map((j,i)=>(
                    <div key={i} style={{ background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:8, padding:"7px 10px", display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:26, height:26, borderRadius:7, flexShrink:0, background:"#dbeafe", border:"1px solid #93c5fd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>💼</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:C.g800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{[j.title, j.company].filter(Boolean).join(" at ") || "—"}</div>
                        {liRange(j.start, j.end) && <div style={{ fontSize:9, color:C.g400, fontWeight:600, marginTop:1 }}>{liRange(j.start, j.end)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          if (sec === "education" && (p.education || []).length > 0) {
            return (
              <div key="education" style={{ marginBottom:10 }}>
                <div style={{ fontSize:8, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5 }}>Education</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {(p.education || []).map((e,i)=>{ const deg=[e.degree, e.field].filter(Boolean).join(" in "); return (
                    <div key={i} style={{ background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:8, padding:"7px 10px", display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:26, height:26, borderRadius:7, flexShrink:0, background:"#dbeafe", border:"1px solid #93c5fd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🎓</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:C.g800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{deg || e.school || "—"}</div>
                        <div style={{ fontSize:9, color:C.g400, fontWeight:600, marginTop:1 }}>{[deg ? e.school : null, liRange(e.start, e.end)].filter(Boolean).join(" · ")}</div>
                      </div>
                    </div>
                  ); })}
                </div>
              </div>
            );
          }
          return null;
        })}

        {creditsUsed>0 && <div style={{ marginBottom:10 }}><span className="cr-badge"><span>🪙</span><b>{creditsUsed} Credits</b> used for this enrichment</span></div>}

        <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
          {p.linkedinUrl && <a href={p.linkedinUrl.startsWith("http")?p.linkedinUrl:`https://${p.linkedinUrl}`} target="_blank" rel="noreferrer" className="bg" style={{ flex:1, minWidth:120, padding:"8px", borderRadius:8, fontSize:11, fontWeight:700, textAlign:"center", textDecoration:"none" }}>🔗 Open LinkedIn</a>}
          <button onClick={()=>copy(p.linkedinUrl || "")} className="bs" style={{ flex:1, minWidth:120, padding:"8px", borderRadius:8, fontSize:11, fontWeight:700 }}>⧉ Copy URL</button>
          <button onClick={handleCopyAll} className="bs" style={{ flex:1, minWidth:120, padding:"8px", borderRadius:8, fontSize:11, fontWeight:700 }}>⧉ Copy all</button>
          <ExportMenu style={{ flex:1, minWidth:120 }} columns={exportCols} rows={exportRows} />
        </div>
      </div>
    </div>
  );
}

function LinkedInEnrich({ openJobId, clearOpenJobId, highlightVal, clearHighlightVal }) {
  const { balance, spend, canAfford, updateBalance } = useCredits();
  const [mode,setMode]   = useState("single");
  const [val,setVal]     = useState("");
  const [phase,setPhase] = useState("idle"); // idle | selecting | loading | success | error
  const [profile,setProfile] = useState(null);
  const [meta,setMeta] = useState(null); // { creditsCharged, balanceRemaining, cached }
  const [creditsUsed,setCreditsUsed] = useState(0);
  const [err,setErr] = useState(""); const [errCredit,setErrCredit] = useState(false);
  // bulk
  const [text,setText] = useState(""); const [drag,setDrag] = useState(false); const [fname,setFname] = useState("");
  const [bPhase,setBPhase] = useState("idle"); // idle | running | done
  const [bRows,setBRows] = useState([]); const [bErr,setBErr] = useState("");
  const [fieldModal,setFieldModal] = useState(false);
  const [pickKind,setPickKind] = useState("person");
  const fileRef = useRef(); const inputRef = useRef();

  // History state
  const [histories, setHistories] = useState([]);
  const [historiesLoading, setHistoriesLoading] = useState(false);
  const [historyItemDetails, setHistoryItemDetails] = useState(null);
  const [activeProfileModal, setActiveProfileModal] = useState(null);
  const [bulkTab, setBulkTab] = useState("process"); // process | completed
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [jobQuery, setJobQuery] = useState("");
  const [currentBulkFields, setCurrentBulkFields] = useState([]);

  useEffect(()=>{if(mode==="single")inputRef.current?.focus();},[mode]);

  const kind = liInputKind(val);
  const valid = !!kind;

  const loadHistoriesList = async () => {
    setHistoriesLoading(true);
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + '/enrich/history?module=linkedin', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setHistories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoriesLoading(false);
    }
  };

  const loadHistoryItemDetails = async (id) => {
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + `/enrich/history/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryItemDetails(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (openJobId) {
      setMode("history");
      loadHistoryItemDetails(openJobId);
      clearOpenJobId?.();
    }
  }, [openJobId]);

  useEffect(() => {
    if (historyItemDetails && highlightVal) {
      setTimeout(() => {
        const match = historyItemDetails.records && historyItemDetails.records.find(r => 
          (r.inputVal && r.inputVal.toLowerCase().includes(highlightVal.toLowerCase())) ||
          (r.output && (
            (r.output.fullName && r.output.fullName.toLowerCase().includes(highlightVal.toLowerCase())) ||
            (r.output.email && r.output.email.toLowerCase().includes(highlightVal.toLowerCase()))
          ))
        );
        if (match) {
          const rowId = `record_row_${(match.inputVal || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
          const el = document.getElementById(rowId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 500);
      clearHighlightVal?.();
    }
  }, [historyItemDetails, highlightVal]);

  const getExportPropsForJob = (item) => {
    const isBulk = item.processingType === "bulk";
    const yr = s => {
      const d = new Date(s);
      return isNaN(d) ? "" : d.getFullYear();
    };

    if (isBulk && item.fields && item.fields.length > 0) {
      const columns = item.fields.map(f => {
        if (f === "workHistory") return { key: "jobHistory", label: "Work History" };
        return FIELD_META_MAP[f] || { key: f, label: f };
      });

      const doneRecords = (item.records || []).filter(r => r.status === "done" || r.status === "success");
      const rows = doneRecords.map(r => {
        const p = r.output || r.profile || {};
        const row = {};
        item.fields.forEach(f => {
          if (f === "fullName") {
            row.fullName = (p.fullName || "").replace(/\s+/g, ' ').trim();
          } else if (f === "workHistory") {
            row.jobHistory = (p.jobHistory || []).map(j => `${[j.title, j.company].filter(Boolean).join(" at ")}${j.start ? ` (${yr(j.start)}–${yr(j.end) || "Present"})` : ""}`).join(" | ");
          } else if (f === "education") {
            row.education = (p.education || []).map(e => {
              const left = [e.degree, e.field].filter(Boolean).join(", ");
              const main = [left, e.school].filter(Boolean).join(" – ");
              return `${main}${e.start ? ` (${yr(e.start)}–${yr(e.end) || "Present"})` : ""}`;
            }).join(" | ");
          } else if (f === "companyDomain") {
            row.companyDomain = p.companyDomain || p.website || "";
          } else if (f === "skills") {
            row.skills = (p.skills || []).join("; ");
          } else if (f === "email") {
            row.email = p.email || "Email Not Found";
          } else if (f === "headline") {
            row.headline = p.headline || (p.raw && p.raw.headline) || "";
          } else {
            row[f] = p[f] || "";
          }
        });
        return row;
      });

      return { columns, rows };
    } else {
      const columns = [
        { key: "fullName", label: "Name" },
        { key: "jobTitle", label: "Job Title" },
        { key: "company", label: "Company" },
        { key: "companyDomain", label: "Company Domain / Website" },
        { key: "location", label: "Location" },
        { key: "industry", label: "Industry" },
        { key: "linkedinUrl", label: "LinkedIn URL" },
        { key: "skills", label: "Skills" },
        { key: "jobHistory", label: "Work History" },
        { key: "education", label: "Education" },
        { key: "headline", label: "Headline" }
      ];
      if (item.fields?.includes("email")) {
        columns.splice(3, 0, { key: "email", label: "Email" });
      }

      const doneRecords = (item.records || []).filter(r => r.status === "done" || r.status === "success");
      const rows = doneRecords.map(r => {
        const p = r.output || r.profile || {};
        const row = {
          fullName: (p.fullName || "").replace(/\s+/g, ' ').trim(),
          jobTitle: p.jobTitle || "",
          company: p.company || "",
          companyDomain: p.companyDomain || p.website || "",
          location: p.location || "",
          industry: p.industry || "",
          linkedinUrl: p.linkedinUrl || "",
          skills: (p.skills || []).join("; "),
          jobHistory: (p.jobHistory || []).map(j => `${[j.title, j.company].filter(Boolean).join(" at ")}${j.start ? ` (${yr(j.start)}–${yr(j.end) || "Present"})` : ""}`).join(" | "),
          education: (p.education || []).map(e => {
            const left = [e.degree, e.field].filter(Boolean).join(", ");
            const main = [left, e.school].filter(Boolean).join(" – ");
            return `${main}${e.start ? ` (${yr(e.start)}–${yr(e.end) || "Present"})` : ""}`;
          }).join(" | "),
          headline: p.headline || (p.raw && p.raw.headline) || ""
        };
        if (item.fields?.includes("email")) {
          row.email = p.email || "Email Not Found";
        }
        return row;
      });

      return { columns, rows };
    }
  };

  const exportColumns = [
    { key: "jobName", label: "Job Name" },
    { key: "jobDate", label: "Date / Time" },
    { key: "jobType", label: "Type" },
    { key: "jobInput", label: "Input Value / Preview" },
    { key: "contactInput", label: "Enrichment Input" },
    { key: "status", label: "Status" },
    { key: "error", label: "Error" },
    { key: "fullName", label: "Name" },
    { key: "jobTitle", label: "Job Title" },
    { key: "company", label: "Company" },
    { key: "email", label: "Email" },
    { key: "companyDomain", label: "Company Domain / Website" },
    { key: "location", label: "Location" },
    { key: "industry", label: "Industry" },
    { key: "linkedinUrl", label: "LinkedIn URL" },
    { key: "skills", label: "Skills" },
    { key: "jobHistory", label: "Work History" },
    { key: "education", label: "Education" },
    { key: "headline", label: "Headline" }
  ];

  const getExportDataForItems = (itemsList) => {
    const exportRows = [];
    itemsList.forEach(item => {
      const jobDateStr = formatJobDate(item.createdAt);
      const isBulk = item.processingType === "bulk";
      const jobInputStr = isBulk 
        ? `📁 Bulk Run (${item.records?.length || 0} records)` 
        : (item.records && item.records[0] ? item.records[0].inputVal : "—");
        
      (item.records || []).forEach(record => {
        const p = record.output || {};
        const yr = s => {
          const d = new Date(s);
          return isNaN(d) ? "" : d.getFullYear();
        };
        
        exportRows.push({
          jobName: item.jobName || "",
          jobDate: jobDateStr,
          jobType: item.processingType,
          jobInput: jobInputStr,
          contactInput: record.inputVal || "",
          status: record.status || "done",
          error: record.error || "",
          fullName: (p.fullName || "").replace(/\s+/g, ' ').trim(),
          jobTitle: p.jobTitle || "",
          company: p.company || "",
          email: p.email || (item.fields?.includes("email") ? "Email Not Found" : ""),
          companyDomain: p.companyDomain || p.website || "",
          location: p.location || "",
          industry: p.industry || "",
          linkedinUrl: p.linkedinUrl || "",
          skills: (p.skills || []).join("; "),
          jobHistory: (p.jobHistory || []).map(j => `${[j.title, j.company].filter(Boolean).join(" at ")}${j.start ? ` (${yr(j.start)}–${yr(j.end) || "Present"})` : ""}`).join(" | "),
          education: (p.education || []).map(e => {
            const left = [e.degree, e.field].filter(Boolean).join(", ");
            const main = [left, e.school].filter(Boolean).join(" – ");
            return `${main}${e.start ? ` (${yr(e.start)}–${yr(e.end) || "Present"})` : ""}`;
          }).join(" | "),
          headline: (p.raw && p.raw.headline) || ""
        });
      });
    });
    return exportRows;
  };

  const filteredHistories = histories.filter(item => {
    if (!jobQuery.trim()) return true;
    const name = item.jobName || "";
    return name.toLowerCase().includes(jobQuery.toLowerCase().trim());
  });

  useEffect(() => {
    if (mode === "history") {
      loadHistoriesList();
      setHistoryItemDetails(null);
      setSelectedIds(new Set());
      setJobQuery("");
    }
  }, [mode]);

  const resetAll = () => { setPhase("idle"); setVal(""); setProfile(null); setMeta(null); setErr(""); setErrCredit(false); setCreditsUsed(0); setText(""); setFname(""); setBPhase("idle"); setBRows([]); setBErr(""); setFieldModal(false); setHistoryItemDetails(null); setActiveProfileModal(null); setBulkTab("process"); setSelectedIds(new Set()); setJobQuery(""); setCurrentBulkFields([]); };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(histories.map(h => h._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + `/enrich/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        loadHistoriesList();
      } else {
        alert("Failed to delete record");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete record");
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete the ${count} selected job(s)?`)) return;
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + '/enrich/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      if (res.ok) {
        setSelectedIds(new Set());
        loadHistoriesList();
      } else {
        alert("Failed to delete records");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete records");
    }
  };

  const openPicker = () => {
    if (!valid) return;
    if (!canAfford('linkedin')) {
      promptBuyCredits();
      return;
    }
    const v = val.trim();
    const k = kind === "url" && /linkedin\.com\/company\//i.test(v) ? "company" : "person";
    setPickKind(k);
    setErr("");
    setErrCredit(false);
    setProfile(null);
    setMeta(null);
    setCreditsUsed(0);
    setPhase("selecting");
    setFieldModal(true);
  };

  const runGenerate = async (fields, jobName) => {
    setFieldModal(false);
    setPhase("loading");
    setErr("");
    setErrCredit(false);
    setProfile(null);
    setMeta(null);
    const { ok, status, data } = await enrichFetch('/enrich/linkedin', { input: val.trim(), type: pickKind, fields });
    if (ok) {
      setProfile(data.data || null);
      setMeta(data.meta || null);
      setCreditsUsed((data.meta && data.meta.creditsCharged) || 0);
      setPhase("success");
      if (data.meta && typeof data.meta.balanceRemaining === 'number') {
        updateBalance(data.meta.balanceRemaining);
      }
      refreshUser();

      // Save to history
      const token = localStorage.getItem('prospecto_token') || '';
      fetch(API_BASE + '/enrich/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          processingType: 'single',
          module: 'linkedin',
          fields,
          jobName,
          records: [{
            inputVal: val.trim(),
            output: data.data || null,
            status: 'done'
          }]
        })
      }).catch(e => console.error('Failed to save single history', e));
    } else {
      const appOutOfCredits = status === 402;
      setErr(data.error || (status===404 ? "Profile not found" : "Enrichment failed"));
      setErrCredit(appOutOfCredits);
      if (appOutOfCredits) promptBuyCredits();
      setPhase("error");
    }
  };

  // Look up an email via Anymail Finder (backend proxy). Throws on failure so the modal shows its error state.
  const fetchEmail = async ({ name, domain }) => {
    const { ok, status, data } = await enrichFetch('/enrich/find-email', { name, domain });
    refreshUser();
    if (!ok) { if (status === 402) promptBuyCredits(); throw new Error(data.error || "Lookup failed"); }
    if (typeof data.credits === 'number') {
      updateBalance(data.credits);
    }
    return { email: data.email, confidence: data.confidence };
  };

  const onFile = (file) => {
    if (!file) return; setFname(file.name);
    const reader = new FileReader();
    reader.onload = e => setText(String(e.target.result || ""));
    reader.readAsText(file);
  };

  const parseInputs = (t) => t.split(/\r?\n/).map(l=>l.split(",")[0].trim()).filter(l=>liInputKind(l));

  const openPickerBulk = () => {
    const inputs = parseInputs(text);
    if (!inputs.length) { setBErr("Add valid emails or LinkedIn URLs (one per line)"); return; }
    if (!canAfford('linkedin', inputs.length)) {
      setBErr("Out of credits for this bulk size");
      promptBuyCredits();
      return;
    }
    setBErr("");
    setPickKind("person");
    setFieldModal(true);
  };

  const runBulk = async (fields, jobName) => {
    setCurrentBulkFields(fields);
    setFieldModal(false);
    const inputs = parseInputs(text);
    if (!inputs.length) { setBErr("Add valid emails or LinkedIn URLs (one per line)"); return; }
    setBErr("");
    const rows = inputs.map(input => ({ input, kind: liInputKind(input), status:"queued", profile:null, error:"" }));
    setBRows(rows); setBPhase("running");
    for (let i=0; i<rows.length; i++) {
      setBRows(prev => prev.map((r,idx)=> idx===i ? { ...r, status:"enriching" } : r));
      const { ok, status, data } = await enrichFetch('/enrich/linkedin', { input: rows[i].input, fields, isBulk: true });
      if (ok) {
        rows[i].status = "done";
        rows[i].profile = data.data;
        setBRows(prev => prev.map((r,idx)=> idx===i ? { ...r, status:"done", profile:data.data } : r));
        if (data.meta && typeof data.meta.balanceRemaining === 'number') {
          updateBalance(data.meta.balanceRemaining);
        }
      } else if (status === 402 && !data.provider) {
        setBErr("Out of credits — bulk stopped early"); promptBuyCredits();
        for (let j=i; j<rows.length; j++) {
          rows[j].status = "failed";
          rows[j].error = "Out of credits";
        }
        setBRows(prev => prev.map((r,idx)=> idx>=i ? { ...r, status:"failed", error:"Out of credits" } : r));
        break;
      } else {
        rows[i].status = "failed";
        rows[i].error = data.error || "Failed";
        setBRows(prev => prev.map((r,idx)=> idx===i ? { ...r, status:"failed", error:data.error||"Failed" } : r));
      }
      refreshUser();
    }
    setBPhase("done");

    // Save bulk results to history
    const token = localStorage.getItem('prospecto_token') || '';
    const records = rows.map(r => ({
      inputVal: r.input,
      output: r.profile || null,
      status: r.status === "done" ? "done" : "failed",
      error: r.error || ""
    }));
    fetch(API_BASE + '/enrich/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        processingType: 'bulk',
        module: 'linkedin',
        fields,
        jobName,
        records
      })
    }).catch(e => console.error('Failed to save bulk history', e));
  };

  const doneRows = bRows.filter(r=>r.status==="done");
  const bCounts = { total:bRows.length, done:doneRows.length, failed:bRows.filter(r=>r.status==="failed").length };
  const stStyle = { queued:{c:C.g400,bg:C.g50,bd:C.g150,l:"Queued"}, enriching:{c:C.li,bg:"#dbeafe",bd:"#93c5fd",l:"Enriching…"}, done:{c:C.gr,bg:C.grL,bd:C.grB,l:"Done"}, failed:{c:C.re,bg:C.reL,bd:C.reB,l:"Failed"} };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"#dbeafe", border:"1.5px solid #93c5fd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🔗</div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:C.g800 }}>LinkedIn Enrichment</div>
            <div style={{ fontSize:10, color:C.g400 }}>Enter email or LinkedIn URL → enrich profile data</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button 
            className={`mode-btn${mode==="history" ? " active" : ""}`} 
            style={{ 
              background: mode==="history" ? C.li : "#e2e6ff", 
              color: mode==="history" ? "#fff" : "#8892cc",
              border: "none",
              borderRadius: "99px",
              padding: "6px 20px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: mode==="history" ? `0 2px 10px ${C.li}33` : "none",
              transition: "all .22s cubic-bezier(.22,1,.36,1)"
            }}
            onClick={() => { setMode("history"); resetAll(); }}
          >
            Jobs
          </button>
          <ModeToggle mode={mode} onChange={m=>{setMode(m);resetAll();}}/>
        </div>
      </div>

      {mode==="single" && (
        <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1, minHeight:0, overflowY:"auto", paddingRight:2 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flexShrink:0 }}>
            <div style={{ marginBottom:12 }}><CreditInfo toolKey="linkedin" mode="single"/></div>
            <div style={{ display:"flex", gap:7, marginBottom:9, alignItems:"center" }}>
              {["Email address","LinkedIn URL"].map(t => <span key={t} style={{ fontSize:10, fontWeight:600, color:C.g400, background:C.g50, border:`1px solid ${C.g150}`, borderRadius:6, padding:"2px 9px" }}>{t}</span>)}
              {val.trim() && <span style={{ fontSize:9, fontWeight:700, marginLeft:"auto", color:valid?C.li:C.am }}>{kind==="email"?"✉ Email detected":kind==="url"?"in URL detected":"⚠ Not a valid email or LinkedIn URL"}</span>}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1, position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:kind==="url"?10:13, color:valid?C.li:C.g400, fontWeight:kind==="url"?900:"normal", fontFamily:kind==="url"?"serif":"inherit", pointerEvents:"none" }}>{kind==="url"?"in":"✉"}</span>
                <input id="linkedin_url_input" ref={inputRef} className="inp" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&valid&&openPicker()} placeholder="sarah.chen@nexlayer.io  or  linkedin.com/in/sarah-chen" style={{ width:"100%", padding:"10px 12px 10px 30px", borderRadius:8, fontSize:13, height:"42px", boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=C.li;e.target.style.boxShadow=`0 0 0 3px ${C.li}18`;}} onBlur={e=>{e.target.style.borderColor=C.g150;e.target.style.boxShadow="none";}}/>
              </div>
              <button onClick={openPicker} disabled={!valid||phase==="loading"||!canAfford('linkedin')} style={{ background:C.li, color:"#fff", border:"none", borderRadius:8, padding:"0 20px", height:"42px", boxSizing:"border-box", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, cursor:(valid&&canAfford('linkedin'))?"pointer":"not-allowed", opacity:(valid&&canAfford('linkedin'))?1:.42, boxShadow:`0 3px 12px ${C.li}44`, whiteSpace:"nowrap", transition:"all .18s" }}>
                {!canAfford('linkedin') ? "Insufficient Credits 🪙" : "Next →"}
              </button>
            </div>
          </div>

          {phase==="loading"&&<div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", flexShrink:0 }}><div style={{ display:"flex", gap:11, marginBottom:10 }}><div className="bone" style={{ width:46, height:46, borderRadius:12, flexShrink:0 }}/><div style={{ flex:1 }}><div className="bone" style={{ width:"50%", height:14, marginBottom:6 }}/><div className="bone" style={{ width:"68%", height:11 }}/></div></div><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:7 }}>{Array(4).fill(0).map((_,i)=><div key={i} className="bone" style={{ height:44, borderRadius:8 }}/>)}</div></div>}
          {phase==="success"&&profile&&<LinkedInProfileCard p={profile} creditsUsed={creditsUsed}/>}
          {phase==="error"&&<div className="fi" style={{ background:C.reL, border:`1.5px solid ${C.reB}`, borderRadius:13, padding:"14px 16px", flexShrink:0, display:"flex", alignItems:"center", gap:10 }}><span style={{ fontSize:22 }}>⚠️</span><div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:800, color:C.re }}>{err}</div>{errCredit && <button onClick={promptBuyCredits} className="bb" style={{ marginTop:8, borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700 }}>＋ Add credits</button>}</div></div>}
          {phase==="idle"&&<div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, opacity:.4 }}><div style={{ fontSize:32 }}>🔗</div><div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:C.g500, textAlign:"center" }}>Enter an email or LinkedIn URL above</div></div>}
        </div>
      )}

      {/* ── BULK ── */}
      {mode==="bulk" && bPhase==="idle" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, overflowY:"auto", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
            <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:11 }}>
              <CreditInfo toolKey="linkedin" mode="bulk"/>
              <div className="uz" onClick={()=>fileRef.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);onFile(e.dataTransfer.files[0]);}} style={{ border:`2px dashed ${drag?C.li:"#93c5fd"}`, borderRadius:11, padding:"22px 16px", textAlign:"center", cursor:"pointer", background:drag?"#dbeafe":C.g50, transition:"all .2s" }}>
                <div style={{ fontSize:30, marginBottom:6 }}>📂</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:13, color:drag?C.li:C.g800, marginBottom:4 }}>{drag?"Drop it!":"Drop CSV or TXT file here"}</div>
                <button className="bb" onClick={e=>{e.stopPropagation();fileRef.current.click();}} style={{ borderRadius:7, padding:"6px 16px", fontSize:11, fontWeight:700, marginBottom:4, background:C.li }}>⬆ Upload file</button>
                <div style={{ fontSize:10, color:C.g400 }}>One email or LinkedIn URL per line</div>
                <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display:"none" }} onChange={e=>onFile(e.target.files[0])}/>
              </div>
              {fname && <div style={{ fontSize:10, color:C.g500 }}>📄 {fname}</div>}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ flex:1, height:1, background:C.g150 }}/><span style={{ fontSize:10, color:C.g400, fontWeight:600 }}>or paste manually</span><div style={{ flex:1, height:1, background:C.g150 }}/></div>
              <textarea className="inp" rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder={"linkedin.com/in/john-doe\nsarah.chen@nexlayer.io\nlinkedin.com/company/acme\n…"} style={{ borderRadius:8, padding:"9px 11px", fontSize:11, fontFamily:"'Courier New',monospace", resize:"none", lineHeight:1.8, width:"100%" }}/>
              {text.trim() && <div style={{ fontSize:10, color:C.g500 }}><b>{parseInputs(text).length}</b> valid inputs · est. up to <b>{parseInputs(text).length*CREDITS.linkedin.cost} credits</b> (5 per profile)</div>}
              {bErr && <div style={{ fontSize:11, fontWeight:700, color:C.re, background:C.reL, border:`1px solid ${C.reB}`, borderRadius:8, padding:"7px 11px" }}>{bErr}</div>}
              {(() => {
                const inputsCount = parseInputs(text).length;
                const isAffordable = canAfford('linkedin', inputsCount);
                return (
                  <button onClick={openPickerBulk} disabled={!inputsCount||!isAffordable} style={{ width:"100%", borderRadius:9, padding:"11px", fontSize:13, fontWeight:800, background:C.li, color:"#fff", border:"none", cursor:(inputsCount&&isAffordable)?"pointer":"not-allowed", opacity:(inputsCount&&isAffordable)?1:.45, boxShadow:`0 3px 12px ${C.li}44` }}>
                    {!isAffordable && inputsCount ? "Insufficient Credits 🪙" : `🔗 Enrich ${inputsCount || ""} Profiles`}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {mode==="bulk" && bPhase!=="idle" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:8 }}>
          <div className="su" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, flexShrink:0 }}>
            {[{l:"Total",v:bCounts.total,c:C.brand,bg:C.lt,bd:C.mid},{l:"Done",v:bCounts.done,c:C.gr,bg:C.grL,bd:C.grB},{l:"Failed",v:bCounts.failed,c:C.re,bg:C.reL,bd:C.reB}].map(s=>(
              <div key={s.l} style={{ background:s.bg, border:`1.5px solid ${s.bd}`, borderRadius:11, padding:"10px 13px" }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:s.c, lineHeight:1, marginBottom:3 }}>{s.v}</div>
                <div style={{ fontSize:10, fontWeight:700, color:s.c, opacity:.75 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {bErr && <div style={{ fontSize:11, fontWeight:700, color:C.re, background:C.reL, border:`1px solid ${C.reB}`, borderRadius:8, padding:"7px 11px", flexShrink:0 }}>{bErr}</div>}
          <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:`linear-gradient(180deg,${C.g50},${C.w})`, flexShrink:0 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <button
                  onClick={() => setBulkTab("process")}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "'Sora',sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    color: bulkTab === "process" ? C.g800 : C.g400,
                    cursor: "pointer",
                    padding: "6px 4px",
                    borderBottom: `2.5px solid ${bulkTab === "process" ? C.brand : "transparent"}`,
                    transition: "all .18s",
                    outline: "none"
                  }}
                >
                  On-Process
                </button>
                <button
                  onClick={() => setBulkTab("completed")}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "'Sora',sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    color: bulkTab === "completed" ? C.g800 : C.g400,
                    cursor: "pointer",
                    padding: "6px 4px",
                    borderBottom: `2.5px solid ${bulkTab === "completed" ? C.brand : "transparent"}`,
                    transition: "all .18s",
                    outline: "none"
                  }}
                >
                  Completed
                </button>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button className="bs" onClick={resetAll} disabled={bPhase==="running"} style={{ fontSize:10, fontWeight:700, borderRadius:6, padding:"5px 10px", opacity:bPhase==="running"?.5:1 }}>↩ New List</button>
                <ExportMenu up={false} {...getExportPropsForJob({ processingType: "bulk", fields: currentBulkFields, records: bRows })} />
              </div>
            </div>
            <div style={{ flex:1, minHeight:0, overflow:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
                <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                  <tr style={{ background:C.g50 }}>
                    {["Status","Name","Company Name","Action"].map(h=>(
                      <th key={h} style={{ padding:"7px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bRows.filter(r => bulkTab === "process" ? (r.status === "queued" || r.status === "enriching") : (r.status === "done" || r.status === "failed")).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding:"24px", textAlign:"center", color:C.g400, fontSize:12, fontWeight:600 }}>
                        {bulkTab === "process" ? "No active enrichment processes" : "No completed enrichment records yet"}
                      </td>
                    </tr>
                  ) : (
                    bRows.filter(r => bulkTab === "process" ? (r.status === "queued" || r.status === "enriching") : (r.status === "done" || r.status === "failed")).map((r,i)=>{ const st=stStyle[r.status]; return (
                      <tr key={i} className="tr" style={{ background:i%2===0?C.w:C.g50 }}>
                        <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}><span style={{ fontSize:9, fontWeight:700, color:st.c, background:st.bg, border:`1px solid ${st.bd}`, borderRadius:5, padding:"2px 7px", whiteSpace:"nowrap" }}>{st.l}</span></td>
                        <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:700, color:C.g800, whiteSpace:"nowrap" }}>{r.profile?.fullName || "—"}</td>
                        <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, color:C.g500, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.profile?.company || "—"}</td>
                        <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}>
                          {r.status === "done" && r.profile && (
                            <button className="bb" onClick={() => setActiveProfileModal({ profile: r.profile, fields: currentBulkFields, isBulk: true })} style={{ padding:"4px 10px", borderRadius:6, fontSize:10, fontWeight:800, background:C.li, color:"#fff", border:"none", cursor:"pointer" }}>
                              Result
                            </button>
                          )}
                        </td>
                      </tr>
                    ); })
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ padding:"7px 14px", borderTop:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`linear-gradient(180deg,${C.w},${C.g50})`, flexShrink:0 }}>
              <span style={{ fontSize:10, color:C.g400 }}>{bCounts.done} of {bCounts.total} enriched</span>
              <span style={{ fontSize:10, color:C.li, fontWeight:800 }}>{bCounts.done*CREDITS.linkedin.cost} credits used</span>
            </div>
          </div>
        </div>
      )}

      {mode==="history" && (
        <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1, minHeight:0, overflowY:"auto", paddingRight:2 }}>
          {historyItemDetails ? (
            <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1 }}>
              <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"12px 16px", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <button className="bs" onClick={() => setHistoryItemDetails(null)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700 }}>
                    ← Back to Jobs
                  </button>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:C.g800 }}>
                    📁 {historyItemDetails.jobName || (historyItemDetails.processingType === "bulk" ? "Bulk Run" : "Single Run")}
                  </span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:historyItemDetails.processingType==="bulk"?C.li:C.gr, background:historyItemDetails.processingType==="bulk"?"#dbeafe":C.grL, border:`1px solid ${historyItemDetails.processingType==="bulk"?"#93c5fd":C.grB}`, borderRadius:20, padding:"2px 8px" }}>
                    {historyItemDetails.processingType}
                  </span>
                  <span style={{ fontSize:11, color:C.g500, fontWeight:600 }}>
                    {formatJobDate(historyItemDetails.createdAt)}
                  </span>
                </div>
              </div>

              {historyItemDetails.processingType === "single" ? (
                historyItemDetails.records && historyItemDetails.records[0] && historyItemDetails.records[0].output ? (
                  <LinkedInProfileCard p={historyItemDetails.records[0].output} creditsUsed={0} />
                ) : (
                  <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", textAlign:"center", color:C.re }}>
                    Failed record: {historyItemDetails.records && historyItemDetails.records[0] ? historyItemDetails.records[0].error : "No output details available"}
                  </div>
                )
              ) : (
                (() => {
                  const doneRows = historyItemDetails.records.filter(r => r.status === "done");
                  const total = historyItemDetails.records.length;
                  const done = doneRows.length;
                  const failed = historyItemDetails.records.filter(r => r.status === "failed").length;
                  return (
                    <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1, minHeight:0 }}>
                      <div className="su" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, flexShrink:0 }}>
                        {[{l:"Total",v:total,c:C.brand,bg:C.lt,bd:C.mid},{l:"Done",v:done,c:C.gr,bg:C.grL,bd:C.grB},{l:"Failed",v:failed,c:C.re,bg:C.reL,bd:C.reB}].map(s=>(
                          <div key={s.l} style={{ background:s.bg, border:`1.5px solid ${s.bd}`, borderRadius:11, padding:"10px 13px" }}>
                            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:s.c, lineHeight:1, marginBottom:3 }}>{s.v}</div>
                            <div style={{ fontSize:10, fontWeight:700, color:s.c, opacity:.75 }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:`linear-gradient(180deg,${C.g50},${C.w})`, flexShrink:0 }}>
                          <span style={{ fontSize:11, fontWeight:700, color:C.g700 }}>On-Process Enrichment</span>
                          <ExportMenu up={false} {...getExportPropsForJob(historyItemDetails)} />
                        </div>
                        <div style={{ flex:1, minHeight:0, overflow:"auto" }}>
                          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
                            <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                              <tr style={{ background:C.g50 }}>
                                {["Status","Name","Company Name","Action"].map(h=>(
                                  <th key={h} style={{ padding:"7px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {historyItemDetails.records.map((r,i)=>{
                                const st=stStyle[r.status] || { c:C.g400, bg:C.g50, bd:C.g150, l:r.status };
                                const rowId = `record_row_${(r.inputVal || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
                                const matchesHighlight = highlightVal && (
                                  (r.inputVal && r.inputVal.toLowerCase().includes(highlightVal.toLowerCase())) ||
                                  (r.output && (
                                    (r.output.fullName && r.output.fullName.toLowerCase().includes(highlightVal.toLowerCase())) ||
                                    (r.output.email && r.output.email.toLowerCase().includes(highlightVal.toLowerCase()))
                                  ))
                                );
                                return (
                                  <tr key={i} id={rowId} className="tr" style={{ background: matchesHighlight ? "rgba(251, 191, 36, 0.25)" : (i%2===0?C.w:C.g50) }}>
                                    <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}><span style={{ fontSize:9, fontWeight:700, color:st.c, background:st.bg, border:`1px solid ${st.bd}`, borderRadius:5, padding:"2px 7px", whiteSpace:"nowrap" }}>{st.l}</span></td>
                                    <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:700, color:C.g800, whiteSpace:"nowrap" }}>{r.output?.fullName || "—"}</td>
                                    <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, color:C.g500, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.output?.company || "—"}</td>
                                    <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                      {r.status === "done" && r.output && (
                                        <button className="bb" onClick={() => setActiveProfileModal({ profile: r.output, fields: historyItemDetails.fields, isBulk: true })} style={{ padding:"4px 10px", borderRadius:6, fontSize:10, fontWeight:800, background:C.li, color:"#fff", border:"none", cursor:"pointer" }}>
                                          Result
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ padding:"7px 14px", borderTop:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`linear-gradient(180deg,${C.w},${C.g50})`, flexShrink:0 }}>
                          <span style={{ fontSize:10, color:C.g400 }}>{done} of {total} enriched</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1 }}>
              {historiesLoading ? (
                <div style={{ display:"flex", flex:1, alignItems:"center", justifyContent:"center", padding:40, color:C.g400, fontWeight:700, fontSize:13 }}>
                  Loading jobs…
                </div>
              ) : histories.length === 0 ? (
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, opacity:.4, padding:40 }}>
                  <div style={{ fontSize:32 }}>📜</div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:C.g500, textAlign:"center" }}>No enrichment jobs found.</div>
                </div>
              ) : (
                <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flex:1, display:"flex", flexDirection:"column" }}>
                  {/* Search Bar */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:`1px solid ${C.g150}`, background:C.g50 }}>
                    <span style={{ fontSize:13 }}>🔍</span>
                    <input
                      type="text"
                      value={jobQuery}
                      onChange={(e) => setJobQuery(e.target.value)}
                      placeholder="Search jobs by name..."
                      style={{
                        flex: 1,
                        border: "none",
                        background: "transparent",
                        fontSize: 12,
                        fontWeight: 500,
                        color: C.g800,
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                    {jobQuery && (
                      <button
                        onClick={() => setJobQuery("")}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: 10,
                          color: C.g400,
                          fontWeight: 800,
                          padding: "2px 6px"
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {selectedIds.size > 0 && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:C.reL, transition:"all .2s" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:C.re }}>{selectedIds.size} items selected</span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <ExportMenu
                          up={false}
                          columns={exportColumns}
                          rows={getExportDataForItems(histories.filter(h => selectedIds.has(h._id)))}
                          label="Export Selected"
                          style={{ display: "inline-block" }}
                          buttonStyle={{
                            background: C.brand,
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 12px",
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        />
                        <button onClick={handleBulkDelete} style={{ background:C.re, color:"#fff", border:"none", borderRadius:6, padding:"5px 12px", fontSize:10, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                          🗑️ Delete Selected
                        </button>
                      </div>
                    </div>
                  )}
                  <div style={{ flex:1, overflowY:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
                      <thead style={{ position:"sticky", top:0, zIndex:1, background:C.g50 }}>
                        <tr>
                          <th style={{ padding:"9px 13px", width:36, borderBottom:`1.5px solid ${C.g150}`, textAlign:"left" }}>
                            <input
                              type="checkbox"
                              checked={filteredHistories.length > 0 && Array.from(selectedIds).filter(id => filteredHistories.some(fh => fh._id === id)).length === filteredHistories.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(prev => {
                                    const next = new Set(prev);
                                    filteredHistories.forEach(fh => next.add(fh._id));
                                    return next;
                                  });
                                } else {
                                  setSelectedIds(prev => {
                                    const next = new Set(prev);
                                    filteredHistories.forEach(fh => next.delete(fh._id));
                                    return next;
                                  });
                                }
                              }}
                              style={{ cursor:"pointer", verticalAlign:"middle" }}
                            />
                          </th>
                          {["Date / Time","Type","Input Value / Preview","Fields","Action"].map(h=>(
                            <th key={h} style={{ padding:"9px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistories.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding:"24px", textAlign:"center", color:C.g400, fontSize:12, fontWeight:600 }}>
                              No matching jobs found.
                            </td>
                          </tr>
                        ) : (
                          filteredHistories.map((item, i) => {
                            const isBulk = item.processingType === "bulk";
                            const displayName = item.jobName || (isBulk 
                              ? `Bulk Run (${item.records?.length || 0} records)` 
                              : (item.records && item.records[0] ? item.records[0].inputVal : "—"));
                            const preview = `📁 ${displayName}`;
                          return (
                            <tr key={item._id} className="tr" style={{ background:i%2===0?C.w:C.g50 }}>
                              <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, width:36 }}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(item._id)}
                                  onChange={() => handleToggleSelect(item._id)}
                                  style={{ cursor:"pointer", verticalAlign:"middle" }}
                                />
                              </td>
                              <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:600, color:C.g700, whiteSpace:"nowrap" }}>
                                {formatJobDate(item.createdAt)}
                              </td>
                              <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                <span style={{ fontSize:9, fontWeight:700, color:isBulk?C.li:C.gr, background:isBulk?"#dbeafe":C.grL, border:`1px solid ${isBulk?"#93c5fd":C.grB}`, borderRadius:5, padding:"2px 7px", whiteSpace:"nowrap", textTransform:"capitalize" }}>
                                  {item.processingType}
                                </span>
                              </td>
                              <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:700, color:C.g800, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {preview}
                              </td>
                              <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                <div style={{ display:"flex", gap:3, flexWrap:"wrap", maxWidth:200 }}>
                                  {(item.fields || []).slice(0,3).map(f => (
                                    <span key={f} style={{ fontSize:8, fontWeight:700, color:C.g500, background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:4, padding:"1px 4px" }}>
                                      {f}
                                    </span>
                                  ))}
                                  {(item.fields || []).length > 3 && (
                                    <span style={{ fontSize:8, fontWeight:700, color:C.g400 }}>
                                      +{item.fields.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                                  <button className="bb" onClick={() => loadHistoryItemDetails(item._id)} style={{ padding:"4px 10px", borderRadius:6, fontSize:10, fontWeight:800, background:C.li, color:"#fff", border:"none", cursor:"pointer" }}>
                                    View Results
                                  </button>
                                  <ExportMenu
                                    up={false}
                                    {...getExportPropsForJob(item)}
                                    label="Export"
                                    style={{ display: "inline-block" }}
                                    buttonStyle={{
                                      background: "transparent",
                                      border: `1px solid ${C.mid}`,
                                      color: C.brand,
                                      borderRadius: 6,
                                      padding: "4px 8px",
                                      fontSize: 10,
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      transition: "all .15s",
                                    }}
                                  />
                                  <button onClick={() => handleDeleteSingle(item._id)} style={{ background:"transparent", border:`1px solid ${C.reB}`, color:C.re, borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:800, cursor:"pointer", transition:"all .15s" }} onMouseEnter={e => {e.target.style.background=C.reL;}} onMouseLeave={e => {e.target.style.background="transparent";}}>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {fieldModal && (
        <LinkedInFieldModal
          kind={pickKind}
          cost={CREDITS.linkedin.cost}
          onClose={()=>{ setFieldModal(false); if (mode === "single") setPhase("idle"); }}
          onGenerate={(keys, name)=>{
            if (mode === "single") {
              runGenerate(keys, name);
            } else {
              runBulk(keys, name);
            }
          }}
        />
      )}

      {activeProfileModal && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,23,42,.55)", backdropFilter:"blur(3px)", padding:16 }} onMouseDown={(e)=>{ if(e.target===e.currentTarget) setActiveProfileModal(null); }}>
          <div style={{ width:"100%", maxWidth:600, background:C.w, borderRadius:18, overflow:"hidden", display:"flex", flexDirection:"column", maxHeight:"88vh", boxShadow:"0 24px 64px -12px rgba(16,24,64,.45)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:`1px solid ${C.g100}` }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.g800 }}>Enrichment Result</span>
              <button onClick={() => setActiveProfileModal(null)} style={{ border:"none", background:"transparent", cursor:"pointer", fontSize:18, color:C.g400, padding:"4px 8px" }}>✕</button>
            </div>
            <div style={{ overflowY:"auto", padding:16, flex:1 }}>
              <LinkedInProfileCard p={activeProfileModal.profile || activeProfileModal} fields={activeProfileModal.fields} isBulk={activeProfileModal.isBulk} creditsUsed={0} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   4. EMAIL VALIDATION
═══════════════════════════════════════════════════ */
function EmailValidation({ prefilledEmails, clearPrefilledEmails, openJobId, clearOpenJobId, highlightVal, clearHighlightVal }) {
  const { balance, spend, canAfford, updateBalance } = useCredits();
  const [mode,setMode]       = useState("single");
  const [val,setVal]         = useState("");
  const [phase,setPhase]     = useState("idle");
  const [result,setResult]   = useState(null);
  const [bPhase,setBPhase]   = useState("idle");
  const [bProg,setBProg]     = useState(0);
  const [bFilter,setBFilter] = useState("all");
  const [text,setText]       = useState("");
  const [drag,setDrag]       = useState(false);
  const [bRows, setBRows]    = useState([]);
  const [bErr, setBErr]      = useState("");
  const [fname, setFname]    = useState("");
  const [bulkTotalCount, setBulkTotalCount] = useState(0);
  const fileRef  = useRef();
  const inputRef = useRef();

  // History state
  const [histories, setHistories] = useState([]);
  const [historiesLoading, setHistoriesLoading] = useState(false);
  const [historyItemDetails, setHistoryItemDetails] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [jobQuery, setJobQuery] = useState("");

  const loadHistoriesList = async () => {
    setHistoriesLoading(true);
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + '/enrich/history?module=validate', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setHistories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoriesLoading(false);
    }
  };

  const loadHistoryItemDetails = async (id) => {
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + `/enrich/history/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryItemDetails(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (openJobId) {
      setMode("history");
      loadHistoryItemDetails(openJobId);
      clearOpenJobId?.();
    }
  }, [openJobId]);

  useEffect(() => {
    if (historyItemDetails && highlightVal) {
      setTimeout(() => {
        const records = historyItemDetails.records || [];
        const rows = records.map(rec => rec.output).filter(Boolean);
        const match = rows.find(r => 
          r.email && r.email.toLowerCase().includes(highlightVal.toLowerCase())
        );
        if (match) {
          setBFilter("all");
          const rowId = `record_row_${(match.email || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
          setTimeout(() => {
            const el = document.getElementById(rowId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 50);
        }
      }, 500);
      clearHighlightVal?.();
    }
  }, [historyItemDetails, highlightVal]);
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + `/enrich/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        loadHistoriesList();
      } else {
        alert("Failed to delete record");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete record");
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete the ${count} selected job(s)?`)) return;
    const token = localStorage.getItem('prospecto_token') || '';
    try {
      const res = await fetch(API_BASE + '/enrich/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      if (res.ok) {
        setSelectedIds(new Set());
        loadHistoriesList();
      } else {
        alert("Failed to delete records");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete records");
    }
  };

  useEffect(() => {
    if (mode === "history") {
      loadHistoriesList();
      setHistoryItemDetails(null);
      setSelectedIds(new Set());
      setJobQuery("");
    }
  }, [mode]);

  const getExportPropsForJob = (item) => {
    const isBulk = item.processingType === "bulk";
    const columns = [
      { key: "email", label: "Email Address" },
      { key: "status", label: "Status" },
      { key: "reason", label: "Reason" },
      { key: "mx", label: "MX Record" },
      { key: "smtp", label: "SMTP Check" },
      { key: "disp", label: "Disposable" }
    ];

    if (isBulk) {
      const rows = (item.records || []).map(rec => {
        const r = rec.output || {};
        return {
          email: r.email || "",
          status: r.status === "valid" ? "Valid" : r.status === "risky" ? "Risky" : "Invalid",
          reason: r.reason || "",
          mx: r.mx ? "Yes" : "No",
          smtp: r.smtp ? "Yes" : "No",
          disp: r.disp ? "Yes" : "No"
        };
      });
      return { columns, rows };
    } else {
      const r = item.records && item.records[0] ? item.records[0].output : {};
      const rows = [{
        email: r.email || "",
        status: r.status === "valid" ? "Valid" : r.status === "risky" ? "Risky" : "Invalid",
        reason: r.reason || "",
        mx: r.mx ? "Yes" : "No",
        smtp: r.smtp ? "Yes" : "No",
        disp: r.disp ? "Yes" : "No"
      }];
      return { columns, rows };
    }
  };

  const exportColumns = [
    { key: "jobName", label: "Job Name" },
    { key: "jobDate", label: "Date / Time" },
    { key: "jobType", label: "Type" },
    { key: "email", label: "Email Address" },
    { key: "status", label: "Status" },
    { key: "reason", label: "Reason" },
    { key: "mx", label: "MX Record" },
    { key: "smtp", label: "SMTP Check" },
    { key: "disp", label: "Disposable" }
  ];

  const getExportDataForItems = (itemsList) => {
    const exportRows = [];
    itemsList.forEach(item => {
      const jobDateStr = formatJobDate(item.createdAt);
      (item.records || []).forEach(record => {
        const r = record.output || {};
        exportRows.push({
          jobName: item.jobName || "",
          jobDate: jobDateStr,
          jobType: item.processingType,
          email: r.email || "",
          status: r.status === "valid" ? "Valid" : r.status === "risky" ? "Risky" : "Invalid",
          reason: r.reason || "",
          mx: r.mx ? "Yes" : "No",
          smtp: r.smtp ? "Yes" : "No",
          disp: r.disp ? "Yes" : "No"
        });
      });
    });
    return exportRows;
  };

  const filteredHistories = histories.filter(item => {
    if (!jobQuery.trim()) return true;
    const name = item.jobName || "";
    return name.toLowerCase().includes(jobQuery.toLowerCase().trim());
  });

  useEffect(() => {
    if (prefilledEmails) {
      setMode("bulk");
      setText(prefilledEmails);
      setFname("");
      clearPrefilledEmails();
    }
  }, [prefilledEmails, clearPrefilledEmails]);

  useEffect(()=>{if(mode==="single")inputRef.current?.focus();},[mode]);

  const onFile = (file) => {
    if (!file) return;
    setFname(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setText(String(e.target.result || ""));
    };
    reader.readAsText(file);
  };

  const parseEmails = (txt) => {
    if (!txt) return [];
    return txt
      .split(/[\r\n,;\t]+/)
      .map(e => e.trim())
      .filter(e => e.length > 3 && e.includes("@") && e.includes(".") && !/\s/.test(e));
  };

  const validateSingle = async () => {
    if (!val.trim()) return;
    if (!canAfford('validate')) {
      promptBuyCredits();
      return;
    }
    setPhase("loading"); setResult(null);
    const { ok, data } = await enrichFetch('/enrich/validate', { email: val.trim() });
    if (ok) {
      const raw = String(data.status || "").toLowerCase();
      const st = raw === "valid" ? "valid"
        : (raw.includes("invalid") || raw.includes("not") || raw.includes("disposable") || raw.includes("undeliverable")) ? "invalid"
        : "risky";
      const finalResult = {
        email: val.trim(), status: st,
        reason: data.status || (st === "valid" ? "Deliverable" : st === "risky" ? "Risky / catch-all" : "Undeliverable"),
        mx: st !== "invalid", smtp: st === "valid", disp: raw.includes("disposable"),
      };
      setResult(finalResult);
      setPhase("done");
      if (typeof data.credits === 'number') {
        updateBalance(data.credits);
      }
      refreshUser();

      // Save to history
      const token = localStorage.getItem('prospecto_token') || '';
      fetch(API_BASE + '/enrich/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          processingType: 'single',
          module: 'validate',
          records: [{
            inputVal: val.trim(),
            output: finalResult,
            status: 'done'
          }]
        })
      }).catch(e => console.error('Failed to save single validation history', e));
    } else {
      setResult({ email: val.trim(), status: "invalid", reason: data.error || "Validation failed", mx: false, smtp: false, disp: false });
      setPhase("done");
    }
  };

  const runBulk = async () => {
    const emails = parseEmails(text);
    if (emails.length === 0) {
      setBErr("Please enter or upload at least one valid email address.");
      return;
    }
    setBErr("");
    const cost = emails.length * COSTS.validate;
    if (!canAfford('validate', cost)) {
      setBErr("Out of credits for this bulk size");
      promptBuyCredits();
      return;
    }

    setBPhase("loading");
    setBProg(0);
    setBRows([]);
    setBulkTotalCount(emails.length);

    try {
      const newBal = await spend('validate', cost);
      updateBalance(newBal);
    } catch (err) {
      setBErr(err.message || "Failed to deduct credits");
      setBPhase("idle");
      return;
    }

    const results = [];
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      try {
        const { ok, data } = await enrichFetch('/enrich/validate', { email });
        if (ok) {
          const raw = String(data.status || "").toLowerCase();
          const st = raw === "valid" ? "valid"
            : (raw.includes("invalid") || raw.includes("not") || raw.includes("disposable") || raw.includes("undeliverable")) ? "invalid"
            : "risky";
          results.push({
            email,
            status: st,
            reason: data.status || (st === "valid" ? "Deliverable" : st === "risky" ? "Risky / catch-all" : "Undeliverable"),
            mx: st !== "invalid",
            smtp: st === "valid",
            disp: raw.includes("disposable")
          });
        } else {
          results.push({
            email,
            status: "invalid",
            reason: data?.error || "Validation failed",
            mx: false,
            smtp: false,
            disp: false
          });
        }
      } catch (err) {
        results.push({
          email,
          status: "invalid",
          reason: "Network error",
          mx: false,
          smtp: false,
          disp: false
        });
      }
      setBProg(Math.round(((i + 1) / emails.length) * 100));
    }
    setBRows(results);
    setBPhase("done");
    refreshUser();

    // Save bulk results to history
    const token = localStorage.getItem('prospecto_token') || '';
    const records = results.map(r => ({
      inputVal: r.email,
      output: r,
      status: r.reason === "Network error" ? "failed" : "done",
      error: r.reason === "Network error" ? "Network error" : ""
    }));
    fetch(API_BASE + '/enrich/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        processingType: 'bulk',
        module: 'validate',
        records
      })
    }).catch(e => console.error('Failed to save bulk validation history', e));
  };

  const bcts = {
    all: bRows.length,
    valid: bRows.filter(r=>r.status==="valid").length,
    invalid: bRows.filter(r=>r.status==="invalid").length,
    risky: bRows.filter(r=>r.status==="risky").length
  };
  const visEV = bFilter==="all" ? bRows : bRows.filter(r => r.status === bFilter);
  const pct = v => bcts.all > 0 ? Math.round((v / bcts.all) * 100) : 0;
  const totalCredits = bcts.all * CREDITS.validate.cost;

  const resetAll = () => {
    setBPhase("idle");
    setBFilter("all");
    setBProg(0);
    setBRows([]);
    setText("");
    setFname("");
    setBErr("");
    setHistoryItemDetails(null);
    setSelectedIds(new Set());
    setJobQuery("");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:C.grL, border:`1.5px solid ${C.grB}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>☑️</div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:C.g800 }}>Email Validation</div>
            <div style={{ fontSize:10, color:C.g400 }}>Validate email addresses — single or in bulk</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button 
            className={`mode-btn${mode==="history" ? " active" : ""}`} 
            style={{ 
              background: mode==="history" ? C.gr : "#e6f8ec", 
              color: mode==="history" ? "#fff" : "#72bf94",
              border: "none",
              borderRadius: "99px",
              padding: "6px 20px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: mode==="history" ? `0 2px 10px ${C.gr}33` : "none",
              transition: "all .22s cubic-bezier(.22,1,.36,1)"
            }}
            onClick={() => { setMode("history"); resetAll(); }}
          >
            Jobs
          </button>
          <ModeToggle mode={mode} onChange={m=>{setMode(m);setPhase("idle");setVal("");setResult(null);resetAll();}}/>
        </div>
      </div>

      {/* ── SINGLE ── */}
      {mode === "single" && (
        <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1, minHeight:0 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flexShrink:0 }}>
            <div style={{ marginBottom:12 }}><CreditInfo toolKey="validate" mode="single"/></div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1, position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:C.g400, pointerEvents:"none" }}>✉</span>
                <input id="validate_email_input" ref={inputRef} className="inp" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&validateSingle()} placeholder="e.g. sarah.chen@nexlayer.io" style={{ width:"100%", padding:"10px 12px 10px 30px", borderRadius:8, fontSize:13, height:"42px", boxSizing:"border-box" }} onFocus={e=>{e.target.style.borderColor=C.gr;e.target.style.boxShadow=`0 0 0 3px ${C.gr}18`;}} onBlur={e=>{e.target.style.borderColor=C.g150;e.target.style.boxShadow="none";}}/>
              </div>
              <button onClick={validateSingle} disabled={!val.trim()||phase==="loading"||!canAfford('validate')} style={{ background:C.gr, color:"#fff", border:"none", borderRadius:8, padding:"0 20px", height:"42px", boxSizing:"border-box", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, cursor:(val.trim()&&canAfford('validate'))?"pointer":"not-allowed", opacity:(val.trim()&&canAfford('validate'))?1:.42, boxShadow:`0 3px 12px ${C.gr}44`, whiteSpace:"nowrap", transition:"all .18s" }}>
                {!canAfford('validate') ? "Insufficient Credits 🪙" : (phase==="loading" ? "Validating…" : "Validate →")}
              </button>
            </div>
          </div>

          {phase==="loading" && (
            <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"16px", flexShrink:0, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", border:`3px solid ${C.g150}`, borderTopColor:C.gr, animation:"sp 1s linear infinite", flexShrink:0 }}/>
              <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
              <div style={{ fontSize:12, color:C.g500 }}>Checking MX records, SMTP handshake, disposable domains…</div>
            </div>
          )}

          {phase==="done" && result && (
            <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 5px 24px rgba(57,83,251,.1)`, flexShrink:0 }}>
              <div style={{ height:3, background:result.status==="valid"?`linear-gradient(90deg,${C.gr},#4ade80)`:result.status==="risky"?`linear-gradient(90deg,${C.am},#fbbf24)`:`linear-gradient(90deg,${C.re},#f87171)` }}/>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  <div style={{ fontSize:32 }}>{result.status==="valid"?"✅":result.status==="risky"?"⚠️":"❌"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:C.g800, marginBottom:3 }}>{result.email}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className={`vb-${result.status[0]}`}>{result.status==="valid"?"✓ Valid":result.status==="risky"?"⚠ Risky":"✗ Invalid"}</span>
                      <span style={{ fontSize:11, color:C.g400 }}>{result.reason}</span>
                      <span className="cr-badge" style={{ marginLeft:"auto" }}>🪙 <b>1 Credit</b> used</span>
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:10 }}>
                  {[{icon:"📡",label:"MX Record",val:result.mx?"Found":"Not found",ok:result.mx},{icon:"🤝",label:"SMTP Check",val:result.smtp?"Passed":"Failed",ok:result.smtp},{icon:"🗑",label:"Disposable",val:result.disp?"Yes — Blocked":"No",ok:!result.disp}].map(c=>(
                    <div key={c.label} style={{ background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:9, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:17 }}>{c.icon}</span>
                      <div><div style={{ fontSize:9, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>{c.label}</div><div style={{ fontSize:12, fontWeight:700, color:c.ok?C.gr:C.re }}>{c.val}</div></div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <ExportMenu
                    up={false}
                    columns={[
                      { key: "email", label: "Email Address" },
                      { key: "status", label: "Status" },
                      { key: "reason", label: "Reason" },
                      { key: "mx", label: "MX Record" },
                      { key: "smtp", label: "SMTP Check" },
                      { key: "disp", label: "Disposable" }
                    ]}
                    rows={[{
                      email: result.email,
                      status: result.status === "valid" ? "Valid" : result.status === "risky" ? "Risky" : "Invalid",
                      reason: result.reason,
                      mx: result.mx ? "Yes" : "No",
                      smtp: result.smtp ? "Yes" : "No",
                      disp: result.disp ? "Yes" : "No"
                    }]}
                    label="⬇ Export Result"
                    style={{ flex: 1 }}
                    buttonStyle={{
                      padding: "8px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700
                    }}
                  />
                  <button className="bs" onClick={()=>{setVal("");setPhase("idle");setResult(null);}} style={{ flex:1, padding:"8px", borderRadius:8, fontSize:11, fontWeight:700 }}>↩ Validate another</button>
                </div>
              </div>
            </div>
          )}

          {phase==="idle" && <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, opacity:.4 }}><div style={{ fontSize:32 }}>☑️</div><div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:C.g500, textAlign:"center" }}>Enter an email address above to validate</div></div>}
        </div>
      )}

      {/* ── BULK ── */}
      {mode==="bulk" && bPhase==="idle" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, overflowY:"auto", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
            <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:11 }}>
              <CreditInfo toolKey="validate" mode="bulk"/>
              <div
                className="uz"
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  const file = e.dataTransfer.files[0];
                  if (file) onFile(file);
                }}
                style={{ border:`2px dashed ${drag?C.gr:C.grB}`, borderRadius:11, padding:"24px 16px", textAlign:"center", cursor:"pointer", background:drag?C.grL:C.g50, transition:"all .2s" }}
              >
                <div style={{ fontSize:32, marginBottom:7 }}>📂</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:13, color:drag?C.gr:C.g800, marginBottom:4 }}>{drag?"Drop it!":"Drop CSV or TXT file here"}</div>
                <button className="bb" onClick={e=>{e.stopPropagation();fileRef.current.click();}} style={{ borderRadius:7, padding:"6px 16px", fontSize:11, fontWeight:700, background:C.gr, marginBottom:4 }}>⬆ Upload file</button>
                <div style={{ fontSize:10, color:C.g400 }}>One email per line · up to 50,000 emails</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt"
                  style={{ display:"none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) onFile(file);
                  }}
                />
              </div>
              {fname && (
                <div className="fi" style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px", background:C.grL, border:`1.5px solid ${C.grB}`, borderRadius:9 }}>
                  <span style={{ fontSize:17 }}>📄</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.g800 }}>{fname}</div>
                    <div style={{ fontSize:9, color:C.g400, marginTop:1 }}>
                      {parseEmails(text).length} emails detected · Est. <b>{parseEmails(text).length * CREDITS.validate.cost} credits</b>
                    </div>
                  </div>
                  <button className="bs" onClick={() => { setFname(""); setText(""); }} style={{ fontSize:10, fontWeight:700, borderRadius:7, padding:"3px 9px" }}>✕</button>
                </div>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ flex:1, height:1, background:C.g150 }}/><span style={{ fontSize:10, color:C.g400, fontWeight:600 }}>or paste emails</span><div style={{ flex:1, height:1, background:C.g150 }}/></div>
              <textarea className="inp" rows={4} value={text} onChange={e=>setText(e.target.value)} placeholder={"john@acme.com\nmia@startup.io\nceo@bigco.com\n…"} style={{ borderRadius:8, padding:"9px 11px", fontSize:11, fontFamily:"'Courier New',monospace", resize:"none", lineHeight:1.8, width:"100%" }}/>
              {text.trim() && !fname && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"#fffbeb", border:`1px solid ${C.amB}`, borderRadius:9 }}>
                  <span style={{ fontSize:13 }}>🪙</span>
                  <span style={{ fontSize:11, color:"#92400e", fontWeight:600 }}>
                    Est. <b>{parseEmails(text).length} credits</b> for {parseEmails(text).length} emails
                  </span>
                </div>
              )}
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {["✓ MX Record","✓ SMTP handshake","✓ Catch-all detect","✓ Disposable filter","✓ Role-based detect"].map(c=>(
                  <span key={c} style={{ fontSize:10, fontWeight:700, color:C.gr, background:C.grL, border:`1px solid ${C.grB}`, borderRadius:6, padding:"3px 9px" }}>{c}</span>
                ))}
              </div>
              {bErr && (
                <div style={{ fontSize:11, fontWeight:700, color:C.re, background:C.reL, border:`1px solid ${C.reB}`, borderRadius:8, padding:"7px 11px" }}>
                  {bErr}
                </div>
              )}
              {(() => {
                const emailCount = parseEmails(text).length;
                const isAffordable = canAfford('validate', emailCount);
                return (
                  <button
                    onClick={runBulk}
                    disabled={!emailCount || !isAffordable}
                    style={{
                      width:"100%",
                      borderRadius:9,
                      padding:"11px",
                      fontSize:13,
                      fontWeight:800,
                      background:C.gr,
                      color:"#fff",
                      border:"none",
                      cursor:(emailCount && isAffordable) ? "pointer" : "not-allowed",
                      opacity:(emailCount && isAffordable) ? 1 : 0.45,
                      boxShadow:`0 3px 12px ${C.gr}44`
                    }}
                  >
                    {!isAffordable && emailCount ? "Insufficient Credits 🪙" : "▶ Start Validation"}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {mode==="bulk" && bPhase==="loading" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:10 }}>
          <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
            <div style={{ position:"relative", width:56, height:56, marginBottom:14 }}>
              <svg width="56" height="56" style={{ position:"absolute", inset:0 }}><circle cx="28" cy="28" r="23" fill="none" stroke={C.g150} strokeWidth="4"/></svg>
              <svg width="56" height="56" style={{ position:"absolute", inset:0 }}><circle cx="28" cy="28" r="23" fill="none" stroke={C.gr} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2*Math.PI*23*bProg/100} ${2*Math.PI*23}`} style={{ filter:`drop-shadow(0 0 4px ${C.gr}88)`, transition:"stroke-dasharray .08s", transform:"rotate(-90deg)", transformOrigin:"center" }}/></svg>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, color:C.gr }}>{Math.floor(bProg)}%</div>
            </div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.g800, marginBottom:4 }}>Validating {bulkTotalCount} emails…</div>
            <div style={{ fontSize:11, color:C.g400, marginBottom:12 }}>Checking MX, SMTP, disposable & catch-all</div>
            <div style={{ display:"flex", gap:14 }}>
              {[["MX Check",bProg>28],["SMTP",bProg>55],["Classify",bProg>80]].map(([l,done])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, color:done?C.gr:C.g300, transition:"color .4s" }}>
                  <span style={{ width:15, height:15, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:8, background:done?C.grL:C.g100, border:`1px solid ${done?C.grB:"#e2e8f0"}`, color:done?C.gr:C.g400, transition:"all .4s" }}>{done?"✓":"·"}</span>{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode==="bulk" && bPhase==="done" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:8 }}>
          <div className="su" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, flexShrink:0 }}>
            {[{l:"Total",v:bcts.all,c:C.brand,bg:C.lt,bd:C.mid},{l:"Valid",v:bcts.valid,c:C.gr,bg:C.grL,bd:C.grB},{l:"Invalid",v:bcts.invalid,c:C.re,bg:C.reL,bd:C.reB},{l:"Risky",v:bcts.risky,c:C.am,bg:C.amL,bd:C.amB}].map(s=>(
              <div key={s.l} style={{ background:s.bg, border:`1.5px solid ${s.bd}`, borderRadius:11, padding:"10px 13px" }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:s.c, lineHeight:1, marginBottom:3 }}>{s.v}</div>
                <div style={{ fontSize:10, fontWeight:700, color:s.c, opacity:.75, marginBottom:5 }}>{s.l}</div>
                <div style={{ height:3, background:`${s.c}20`, borderRadius:99, overflow:"hidden" }}><div style={{ width:`${pct(s.v)}%`, height:"100%", borderRadius:99, background:s.c, transition:"width .8s cubic-bezier(.22,1,.36,1)" }}/></div>
              </div>
            ))}
          </div>
          {/* credit summary */}
          <div className="su" style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:"#fffbeb", border:`1.5px solid ${C.amB}`, borderRadius:10, flexShrink:0 }}>
            <span style={{ fontSize:16 }}>🪙</span>
            <span style={{ fontSize:11, fontWeight:700, color:"#92400e" }}><b>{totalCredits} credits</b> used — {bcts.all} emails × 1 credit each</span>
            <span style={{ marginLeft:"auto", fontSize:10, color:C.am, fontWeight:700 }}>Remaining: <b>{balance.toLocaleString()}</b></span>
          </div>
          {/* table */}
          <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:`linear-gradient(180deg,${C.g50},${C.w})`, flexWrap:"wrap", gap:5, flexShrink:0 }}>
              <div style={{ display:"flex", gap:5 }}>
                {[{id:"all",l:"All",cnt:bcts.all,ac:C.brand,ab:C.lt},{id:"valid",l:"Valid",cnt:bcts.valid,ac:C.gr,ab:C.grL},{id:"invalid",l:"Invalid",cnt:bcts.invalid,ac:C.re,ab:C.reL},{id:"risky",l:"Risky",cnt:bcts.risky,ac:C.am,ab:C.amL}].map(f=>(
                  <button key={f.id} className="fb" onClick={()=>setBFilter(f.id)} style={{ padding:"4px 9px", borderRadius:6, fontSize:10, fontWeight:700, border:`1.5px solid ${bFilter===f.id?f.ac:C.g150}`, background:bFilter===f.id?f.ab:C.w, color:bFilter===f.id?f.ac:C.g400, boxShadow:bFilter===f.id?`0 2px 8px ${f.ac}28`:"none", transition:"all .14s" }}>{f.l} ({f.cnt})</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button className="bs" onClick={resetAll} style={{ fontSize:10, fontWeight:700, borderRadius:6, padding:"5px 10px" }}>↩ New List</button>
                <ExportMenu
                  up={false}
                  columns={[
                    { key: "email", label: "Email Address" },
                    { key: "status", label: "Status" },
                    { key: "reason", label: "Reason" },
                    { key: "mx", label: "MX Record" },
                    { key: "smtp", label: "SMTP Check" },
                    { key: "disp", label: "Disposable" }
                  ]}
                  rows={bRows.map(r => ({
                    email: r.email,
                    status: r.status === "valid" ? "Valid" : r.status === "risky" ? "Risky" : "Invalid",
                    reason: r.reason,
                    mx: r.mx ? "Yes" : "No",
                    smtp: r.smtp ? "Yes" : "No",
                    disp: r.disp ? "Yes" : "No"
                  }))}
                  label="⬇ Export"
                  buttonStyle={{
                    borderRadius: 6,
                    padding: "5px 11px",
                    fontSize: 10,
                    fontWeight: 700
                  }}
                />
              </div>
            </div>
            <div style={{ flex:1, minHeight:0, overflow:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                  <tr style={{ background:C.g50 }}>
                    {["Email Address","Status","Reason","MX Record","SMTP","Disposable"].map(h=>(
                      <th key={h} style={{ padding:"7px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visEV.map((r,i)=>(
                    <tr key={i} className="tr" style={{ background:i%2===0?C.w:C.g50 }}>
                      <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, background:{valid:C.gr,invalid:C.re,risky:C.am}[r.status] }}/>
                          <span style={{ fontSize:11, fontWeight:700, color:C.g800 }}>{r.email}</span>
                        </div>
                      </td>
                      <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}><span className={`vb-${r.status[0]}`}>{r.status==="valid"?"✓ Valid":r.status==="risky"?"⚠ Risky":"✗ Invalid"}</span></td>
                      <td style={{ padding:"8px 13px", fontSize:11, color:C.g500, borderBottom:`1px solid ${C.g100}`, fontWeight:500 }}>{r.reason}</td>
                      <td style={{ padding:"8px 13px", textAlign:"center", borderBottom:`1px solid ${C.g100}`, fontSize:13, fontWeight:700, color:r.status!=="invalid"?C.gr:C.re }}>{r.status!=="invalid"?"✓":"✗"}</td>
                      <td style={{ padding:"8px 13px", textAlign:"center", borderBottom:`1px solid ${C.g100}`, fontSize:13, fontWeight:700, color:r.status==="valid"?C.gr:C.re }}>{r.status==="valid"?"✓":"✗"}</td>
                      <td style={{ padding:"8px 13px", textAlign:"center", borderBottom:`1px solid ${C.g100}`, fontSize:13, fontWeight:700, color:r.status==="invalid"?C.re:C.gr }}>{r.status==="invalid"?"✗":"✓"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding:"7px 14px", borderTop:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`linear-gradient(180deg,${C.w},${C.g50})`, flexShrink:0 }}>
              <span style={{ fontSize:10, color:C.g400 }}>Showing <b style={{ color:C.g700 }}>{visEV.length}</b> of <b style={{ color:C.g700 }}>{bcts.all}</b></span>
              <span style={{ fontSize:10, color:C.gr, fontWeight:800, display:"flex", alignItems:"center", gap:4 }}><span style={{ width:6, height:6, borderRadius:"50%", background:C.gr, display:"inline-block" }}/>Validation complete</span>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {mode==="history" && (
        <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1, minHeight:0, overflowY:"auto", paddingRight:2 }}>
          {historyItemDetails ? (
            <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1 }}>
              <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"12px 16px", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <button className="bs" onClick={() => setHistoryItemDetails(null)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700 }}>
                    ← Back to Jobs
                  </button>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:C.g800 }}>
                    📁 {historyItemDetails.jobName || (historyItemDetails.processingType === "bulk" ? "Bulk Run" : "Single Run")}
                  </span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:historyItemDetails.processingType==="bulk"?C.brand:C.gr, background:historyItemDetails.processingType==="bulk"?C.lt:C.grL, border:`1px solid ${historyItemDetails.processingType==="bulk"?C.mid:C.grB}`, borderRadius:20, padding:"2px 8px" }}>
                    {historyItemDetails.processingType}
                  </span>
                  <span style={{ fontSize:11, color:C.g500, fontWeight:600 }}>
                    {formatJobDate(historyItemDetails.createdAt)}
                  </span>
                </div>
              </div>

              {historyItemDetails.processingType === "single" ? (
                historyItemDetails.records && historyItemDetails.records[0] && historyItemDetails.records[0].output ? (
                  (() => {
                    const r = historyItemDetails.records[0].output || {};
                    return (
                      <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 5px 24px rgba(57,83,251,.1)`, flexShrink:0 }}>
                        <div style={{ height:3, background:r.status==="valid"?`linear-gradient(90deg,${C.gr},#4ade80)`:r.status==="risky"?`linear-gradient(90deg,${C.am},#fbbf24)`:`linear-gradient(90deg,${C.re},#f87171)` }}/>
                        <div style={{ padding:"14px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                            <div style={{ fontSize:32 }}>{r.status==="valid"?"✅":r.status==="risky"?"⚠️":"❌"}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:C.g800, marginBottom:3 }}>{r.email}</div>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <span className={`vb-${r.status[0]}`}>{r.status==="valid"?"✓ Valid":r.status==="risky"?"⚠ Risky":"✗ Invalid"}</span>
                                <span style={{ fontSize:11, color:C.g400 }}>{r.reason}</span>
                                <span className="cr-badge" style={{ marginLeft:"auto" }}>🪙 <b>1 Credit</b> used</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:10 }}>
                            {[{icon:"📡",label:"MX Record",val:r.mx?"Found":"Not found",ok:r.mx},{icon:"🤝",label:"SMTP Check",val:r.smtp?"Passed":"Failed",ok:r.smtp},{icon:"🗑",label:"Disposable",val:r.disp?"Yes — Blocked":"No",ok:!r.disp}].map(c=>(
                              <div key={c.label} style={{ background:C.g50, border:`1.5px solid ${C.g150}`, borderRadius:9, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                                <span style={{ fontSize:17 }}>{c.icon}</span>
                                <div><div style={{ fontSize:9, color:C.g400, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>{c.label}</div><div style={{ fontSize:12, fontWeight:700, color:c.ok?C.gr:C.re }}>{c.val}</div></div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display:"flex", gap:7 }}>
                            <ExportMenu
                              up={false}
                              columns={[
                                { key: "email", label: "Email Address" },
                                { key: "status", label: "Status" },
                                { key: "reason", label: "Reason" },
                                { key: "mx", label: "MX Record" },
                                { key: "smtp", label: "SMTP Check" },
                                { key: "disp", label: "Disposable" }
                              ]}
                              rows={[{
                                email: r.email,
                                status: r.status === "valid" ? "Valid" : r.status === "risky" ? "Risky" : "Invalid",
                                reason: r.reason,
                                mx: r.mx ? "Yes" : "No",
                                smtp: r.smtp ? "Yes" : "No",
                                disp: r.disp ? "Yes" : "No"
                              }]}
                              label="⬇ Export Result"
                              style={{ flex: 1 }}
                              buttonStyle={{
                                padding: "8px",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, padding:"14px 16px", textAlign:"center", color:C.re }}>
                    Failed record: {historyItemDetails.records && historyItemDetails.records[0] ? historyItemDetails.records[0].error : "No output details available"}
                  </div>
                )
              ) : (
                (() => {
                  const records = historyItemDetails.records || [];
                  const rows = records.map(rec => rec.output).filter(Boolean);
                  const cts = {
                    all: rows.length,
                    valid: rows.filter(r => r.status === "valid").length,
                    invalid: rows.filter(r => r.status === "invalid").length,
                    risky: rows.filter(r => r.status === "risky").length
                  };
                  const vis = bFilter === "all" ? rows : rows.filter(r => r.status === bFilter);
                  const pct = v => cts.all > 0 ? Math.round((v / cts.all) * 100) : 0;

                  return (
                    <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1, minHeight:0 }}>
                      <div className="su" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, flexShrink:0 }}>
                        {[
                          { l:"Total",   v:cts.all,     c:C.brand, bg:C.lt,  bd:C.mid  },
                          { l:"Valid",   v:cts.valid,   c:C.gr,    bg:C.grL, bd:C.grB  },
                          { l:"Invalid", v:cts.invalid, c:C.re,    bg:C.reL, bd:C.reB  },
                          { l:"Risky",   v:cts.risky,   c:C.am,    bg:C.amL, bd:C.amB  },
                        ].map(s => (
                          <div key={s.l} style={{ background:s.bg, border:`1.5px solid ${s.bd}`, borderRadius:11, padding:"10px 13px" }}>
                            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:s.c, lineHeight:1, marginBottom:3 }}>{s.v}</div>
                            <div style={{ fontSize:10, fontWeight:700, color:s.c, opacity:.75, marginBottom:5 }}>{s.l}</div>
                            <div style={{ height:3, background:`${s.c}20`, borderRadius:99, overflow:"hidden" }}><div style={{ width:`${pct(s.v)}%`, height:"100%", borderRadius:99, background:s.c, transition:"width .8s cubic-bezier(.22,1,.36,1)" }}/></div>
                          </div>
                        ))}
                      </div>
                      <div className="su" style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:"#fffbeb", border:`1.5px solid ${C.amB}`, borderRadius:10, flexShrink:0 }}>
                        <span style={{ fontSize:16 }}>🪙</span>
                        <span style={{ fontSize:11, fontWeight:700, color:"#92400e" }}><b>{cts.all} credits</b> used — {cts.all} emails × 1 credit each</span>
                      </div>
                      <div className="su" style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, flex:1, minHeight:0, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:`linear-gradient(180deg,${C.g50},${C.w})`, flexWrap:"wrap", gap:5, flexShrink:0 }}>
                          <div style={{ display:"flex", gap:5 }}>
                            {[
                              { id:"all",     l:"All",     cnt:cts.all,     ac:C.brand, ab:C.lt  },
                              { id:"valid",   l:"Valid",   cnt:cts.valid,   ac:C.gr,    ab:C.grL },
                              { id:"invalid", l:"Invalid", cnt:cts.invalid, ac:C.re,    ab:C.reL },
                              { id:"risky",   l:"Risky",   cnt:cts.risky,   ac:C.am,    ab:C.amL },
                            ].map(f => (
                              <button key={f.id} className="fb" onClick={() => setBFilter(f.id)} style={{ padding:"4px 9px", borderRadius:6, fontSize:10, fontWeight:700, border:`1.5px solid ${bFilter===f.id?f.ac:C.g150}`, background:bFilter===f.id?f.ab:C.w, color:bFilter===f.id?f.ac:C.g400, boxShadow:bFilter===f.id?`0 2px 8px ${f.ac}28`:"none", transition:"all .14s" }}>{f.l} ({f.cnt})</button>
                            ))}
                          </div>
                          <div style={{ display:"flex", gap:6 }}>
                            <ExportMenu up={false} {...getExportPropsForJob(historyItemDetails)} />
                          </div>
                        </div>
                        <div style={{ flex:1, minHeight:0, overflow:"auto" }}>
                          <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                              <tr style={{ background:C.g50 }}>
                                {["Email Address","Status","Reason","MX Record","SMTP","Disposable"].map(h=>(
                                  <th key={h} style={{ padding:"7px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {vis.map((r,i)=>{
                                const rowId = `record_row_${(r.email || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
                                const matchesHighlight = highlightVal && r.email && r.email.toLowerCase().includes(highlightVal.toLowerCase());
                                return (
                                  <tr key={i} id={rowId} className="tr" style={{ background: matchesHighlight ? "rgba(251, 191, 36, 0.25)" : (i%2===0?C.w:C.g50) }}>
                                    <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                        <span style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, background:{valid:C.gr,invalid:C.re,risky:C.am}[r.status] }}/>
                                        <span style={{ fontSize:11, fontWeight:700, color:C.g800 }}>{r.email}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding:"8px 13px", borderBottom:`1px solid ${C.g100}` }}><span className={`vb-${r.status[0]}`}>{r.status==="valid"?"✓ Valid":r.status==="risky"?"⚠ Risky":"✗ Invalid"}</span></td>
                                    <td style={{ padding:"8px 13px", fontSize:11, color:C.g500, borderBottom:`1px solid ${C.g100}`, fontWeight:500 }}>{r.reason}</td>
                                    <td style={{ padding:"8px 13px", textAlign:"center", borderBottom:`1px solid ${C.g100}`, fontSize:13, fontWeight:700, color:r.status!=="invalid"?C.gr:C.re }}>{r.status!=="invalid"?"✓":"✗"}</td>
                                    <td style={{ padding:"8px 13px", textAlign:"center", borderBottom:`1px solid ${C.g100}`, fontSize:13, fontWeight:700, color:r.status==="valid"?C.gr:C.re }}>{r.status==="valid"?"✓":"✗"}</td>
                                    <td style={{ padding:"8px 13px", textAlign:"center", borderBottom:`1px solid ${C.g100}`, fontSize:13, fontWeight:700, color:r.status==="invalid"?C.re:C.gr }}>{r.status==="invalid"?"✗":"✓"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div style={{ padding:"7px 14px", borderTop:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:`linear-gradient(180deg,${C.w},${C.g50})`, flexShrink:0 }}>
                          <span style={{ fontSize:10, color:C.g400 }}>Showing <b style={{ color:C.g700 }}>{vis.length}</b> of <b style={{ color:C.g700 }}>{cts.all}</b></span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:11, flex:1 }}>
              {historiesLoading ? (
                <div style={{ display:"flex", flex:1, alignItems:"center", justifyContent:"center", padding:40, color:C.g400, fontWeight:700, fontSize:13 }}>
                  Loading jobs…
                </div>
              ) : histories.length === 0 ? (
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, opacity:.4, padding:40 }}>
                  <div style={{ fontSize:32 }}>📜</div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:C.g500, textAlign:"center" }}>No email validation jobs found.</div>
                </div>
              ) : (
                <div style={{ background:C.w, border:`1.5px solid ${C.g150}`, borderRadius:13, overflow:"hidden", boxShadow:`0 2px 12px rgba(57,83,251,.07)`, flex:1, display:"flex", flexDirection:"column" }}>
                  {/* Search Bar */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:`1px solid ${C.g150}`, background:C.g50 }}>
                    <span>🔍</span>
                    <input
                      type="text"
                      value={jobQuery}
                      onChange={(e) => setJobQuery(e.target.value)}
                      placeholder="Search jobs by name..."
                      style={{
                        flex: 1,
                        border: "none",
                        background: "transparent",
                        fontSize: 12,
                        fontWeight: 500,
                        color: C.g800,
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                    {jobQuery && (
                      <button
                        onClick={() => setJobQuery("")}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: 10,
                          color: C.g400,
                          fontWeight: 800,
                          padding: "2px 6px"
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {selectedIds.size > 0 && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderBottom:`1px solid ${C.g100}`, background:C.reL, transition:"all .2s" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:C.re }}>{selectedIds.size} items selected</span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <ExportMenu
                          up={false}
                          columns={exportColumns}
                          rows={getExportDataForItems(histories.filter(h => selectedIds.has(h._id)))}
                          label="Export Selected"
                          style={{ display: "inline-block" }}
                          buttonStyle={{
                            background: C.gr,
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 12px",
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        />
                        <button onClick={handleBulkDelete} style={{ background:C.re, color:"#fff", border:"none", borderRadius:6, padding:"5px 12px", fontSize:10, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                          🗑️ Delete Selected
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ flex:1, overflowY:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480 }}>
                      <thead style={{ position:"sticky", top:0, zIndex:1, background:C.g50 }}>
                        <tr>
                          <th style={{ padding:"9px 13px", width:36, borderBottom:`1.5px solid ${C.g150}`, textAlign:"left" }}>
                            <input
                              type="checkbox"
                              checked={filteredHistories.length > 0 && Array.from(selectedIds).filter(id => filteredHistories.some(fh => fh._id === id)).length === filteredHistories.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(prev => {
                                    const next = new Set(prev);
                                    filteredHistories.forEach(fh => next.add(fh._id));
                                    return next;
                                  });
                                } else {
                                  setSelectedIds(prev => {
                                    const next = new Set(prev);
                                    filteredHistories.forEach(fh => next.delete(fh._id));
                                    return next;
                                  });
                                }
                              }}
                              style={{ cursor:"pointer", verticalAlign:"middle" }}
                            />
                          </th>
                          {["Date / Time","Type","Input Value / Preview","Action"].map(h=>(
                            <th key={h} style={{ padding:"9px 13px", fontSize:9, fontWeight:800, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", textAlign:"left", borderBottom:`1.5px solid ${C.g150}`, whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistories.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding:"24px", textAlign:"center", color:C.g400, fontSize:12, fontWeight:600 }}>
                              No matching jobs found.
                            </td>
                          </tr>
                        ) : (
                          filteredHistories.map((item, i) => {
                            const isBulk = item.processingType === "bulk";
                            const displayName = item.jobName || (isBulk 
                              ? `Bulk Run (${item.records?.length || 0} records)` 
                              : (item.records && item.records[0] ? item.records[0].inputVal : "—"));
                            const preview = isBulk ? `📁 ${displayName}` : displayName;
                            return (
                              <tr key={item._id} className="tr" style={{ background:i%2===0?C.w:C.g50 }}>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, width:36 }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.has(item._id)}
                                    onChange={() => handleToggleSelect(item._id)}
                                    style={{ cursor:"pointer", verticalAlign:"middle" }}
                                  />
                                </td>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:600, color:C.g700, whiteSpace:"nowrap" }}>
                                  {formatJobDate(item.createdAt)}
                                </td>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                  <span style={{ fontSize:9, fontWeight:700, color:isBulk?C.brand:C.gr, background:isBulk?C.lt:C.grL, border:`1px solid ${isBulk?C.mid:C.grB}`, borderRadius:5, padding:"2px 7px", whiteSpace:"nowrap", textTransform:"capitalize" }}>
                                    {item.processingType}
                                  </span>
                                </td>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}`, fontSize:11, fontWeight:700, color:C.g800, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {preview}
                                </td>
                                <td style={{ padding:"10px 13px", borderBottom:`1px solid ${C.g100}` }}>
                                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                                    <button className="bb" onClick={() => loadHistoryItemDetails(item._id)} style={{ padding:"4px 10px", borderRadius:6, fontSize:10, fontWeight:800, background:C.gr, color:"#fff", border:"none", cursor:"pointer" }}>
                                      View Results
                                    </button>
                                    <ExportMenu
                                      up={false}
                                      {...getExportPropsForJob(item)}
                                      label="Export"
                                      style={{ display: "inline-block" }}
                                      buttonStyle={{
                                        background: "transparent",
                                        border: `1px solid ${C.mid}`,
                                        color: C.gr,
                                        borderRadius: 6,
                                        padding: "4px 8px",
                                        fontSize: 10,
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        transition: "all .15s",
                                      }}
                                    />
                                    <button onClick={() => handleDeleteSingle(item._id)} style={{ background:"transparent", border:`1px solid ${C.reB}`, color:C.re, borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:800, cursor:"pointer", transition:"all .15s" }} onMouseEnter={e => {e.target.style.background=C.reL;}} onMouseLeave={e => {e.target.style.background="transparent";}}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────── */
const META = {
  email:    { title:"Email Finder",           badge:"Live" },
  phone:    { title:"Phone Number Finder",    badge:null   },
  linkedin: { title:"LinkedIn Enrichment",    badge:null   },
  validate: { title:"Email Validation",       badge:null   },
  plans:    { title:"Pricing Plans",          badge:null   },
};

export default function App() {
  const [nav, setNav] = useState(() => {
    if (window.location.pathname === "/pricing") return "plans";
    return "email";
  });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('prospecto_token'));
  const [authLoading, setAuthLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);
  const [prefilledValidationEmails, setPrefilledValidationEmails] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newLookupOpen, setNewLookupOpen] = useState(false);
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const [highlightVal, setHighlightVal] = useState("");
  const [path, setPath] = useState(window.location.pathname);

  const navigate = (newPath) => {
    window.history.pushState({}, "", newPath);
    setPath(newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const stored = localStorage.getItem('prospecto_token');
      if (!stored) return;
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': 'Bearer ' + stored }
      });
      if (res.ok) {
        const data = await res.json();
        const list = (data.notifications || []).map(n => ({
          id: n._id,
          title: n.title,
          time: timeAgo(n.createdAt),
          unread: !n.read
        }));
        setNotifications(list);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('prospecto_token');
    if (!stored) return;
    loadNotifications();
    const iv = setInterval(loadNotifications, 15000);
    return () => clearInterval(iv);
  }, [loadNotifications]);

  const handleSearch = (q) => {
    const queryLower = q.toLowerCase();
    if (queryLower.includes("validation") || queryLower.includes("validate")) {
      setNav("validate");
    } else if (queryLower.includes("phone")) {
      setNav("phone");
    } else if (queryLower.includes("linkedin") || queryLower.includes("enrich")) {
      setNav("linkedin");
    } else if (queryLower.includes("email") || queryLower.includes("finder")) {
      setNav("email");
    }
  };

  const handleSelectResult = (item) => {
    if (item.category === "Code Files & Folders" || item.category === "Files & Folders") {
      setSelectedFilePath(item.path);
      setCodeViewerOpen(true);
    } else if (item.category === "Sections & Fields") {
      if (item.target.startsWith("modal_")) {
        const modalName = item.target.replace("modal_", "");
        if (modalName === "profile") setProfileOpen(true);
        else if (modalName === "settings") setSettingsOpen(true);
        else if (modalName === "faq") setFaqOpen(true);
        else if (modalName === "buy") setBuyOpen(true);
        else if (modalName === "new_lookup") setNewLookupOpen(true);
      } else {
        setNav(item.target);
        if (item.focus) {
          setTimeout(() => {
            const el = document.getElementById(item.focus);
            if (el) {
              el.focus();
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }
      }
    } else {
      if (item.target) {
        setNav(item.target);
        if (item.id) {
          setActiveJobId(item.id);
        }
        if (item.recordVal) {
          setHighlightVal(item.recordVal);
        }
      }
    }
  };

  async function handlePurchase(pkg) {
    try {
      const stored = localStorage.getItem('prospecto_token');
      if (!stored) return;
      const res = await fetch(`${API_BASE}/credits/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + stored
        },
        body: JSON.stringify({ credits: pkg.credits })
      });
      if (res.ok) {
        const data = await res.json();
        setUser((u) => u ? { ...u, credits: data.credits } : u);
        // Dispatch event to refresh credits provider
        window.dispatchEvent(new CustomEvent('prospecto:refresh-user'));
      } else {
        setUser((u) => u ? { ...u, credits: (u.credits || 0) + pkg.credits } : u);
      }
    } catch (e) {
      setUser((u) => u ? { ...u, credits: (u.credits || 0) + pkg.credits } : u);
    }
    setBuyOpen(false);
  }

  const handleSelectPlan = async (planName, billing) => {
    try {
      const token = localStorage.getItem('prospecto_token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ plan: planName })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        const errData = await res.json();
        console.error(errData.error || "Failed to update plan");
      }
    } catch (err) {
      console.error("Plan update error:", err);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      const stored = localStorage.getItem('prospecto_token');
      if (!stored) {
        setAuthLoading(false);
        return;
      }
      try {
        const data = await apiGetMe(stored);
        if (data.user) {
          setUser(data.user);
          setToken(stored);
          if (window.location.pathname === "/login" || window.location.pathname === "/signup") {
            navigate("/");
          } else if (window.location.pathname === "/pricing") {
            setNav("plans");
          }
        } else {
          localStorage.removeItem('prospecto_token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('prospecto_token');
        setToken(null);
      }
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const onRefresh = async () => {
      const stored = localStorage.getItem('prospecto_token');
      if (!stored) return;
      const data = await apiGetMe(stored);
      if (data.user) setUser(data.user);
    };
    const onBuy = () => setBuyOpen(true);
    window.addEventListener('prospecto:refresh-user', onRefresh);
    window.addEventListener('prospecto:buy-credits', onBuy);
    return () => {
      window.removeEventListener('prospecto:refresh-user', onRefresh);
      window.removeEventListener('prospecto:buy-credits', onBuy);
    };
  }, []);

  function handleAuthSuccess(t, u) {
    setToken(t);
    setUser(u);
    navigate("/");
  }

  function handleLogout() {
    localStorage.removeItem('prospecto_token');
    setUser(null);
    setToken(null);
    navigate("/");
  }

  const handleAuthSubmit = async ({ mode, name, email, password }) => {
    if (mode === 'login') {
      const data = await apiLogin(email, password);
      if (data.error) {
        return { error: data.error };
      } else if (data.token && data.user) {
        localStorage.setItem('prospecto_token', data.token);
        handleAuthSuccess(data.token, data.user);
      } else {
        return { error: 'Login failed' };
      }
    } else {
      const data = await apiRegister(name, email, password);
      if (data.error) {
        return { error: data.error };
      } else if (data.token && data.user) {
        localStorage.setItem('prospecto_token', data.token);
        handleAuthSuccess(data.token, data.user);
      } else {
        return { error: 'Registration failed' };
      }
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2ff', fontFamily: "'Figtree',sans-serif" }}>        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.g150}`, borderTopColor: C.brand, animation: 'sp 1s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: C.g500, fontWeight: 600 }}>Loading Prospecto…</div>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    if (path === "/login" || path === "/signup") {
      return (
        <LoginPage
          key={path}
          onSubmit={handleAuthSubmit}
          initialMode={path === "/signup" ? "signup" : "login"}
          onBack={() => navigate("/")}
        />
      );
    }
    if (path === "/pricing") {
      return (
        <div style={{ height: "100vh", width: "100vw", padding: "24px", boxSizing: "border-box", background: "#f4f6fc" }}>
          <PricingSection
            onSelectPlan={() => navigate("/signup")}
            onBack={() => navigate("/")}
          />
        </div>
      );
    }
    return (
      <HomePage
        onLogin={() => navigate("/login")}
        onGetStarted={() => navigate("/signup")}
        onPricing={() => navigate("/pricing")}
      />
    );
  }

  const m = META[nav];
  return (
    <CreditsProvider token={token} user={user} onBalanceUpdate={(newBal) => setUser(u => u ? { ...u, credits: newBal } : null)}>
      <div style={{ display:"flex", height:"100vh", width:"100vw", overflow:"hidden", fontFamily:"'Figtree',sans-serif", background:C.g50 }}>        <Sidebar active={nav} onNav={setNav} user={user} onLogout={handleLogout} onBuyCredits={() => setBuyOpen(true)} onProfile={() => setProfileOpen(true)} onSettings={() => setSettingsOpen(true)}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
          <TopBar
            onSearch={handleSearch}
            onSelectResult={handleSelectResult}
            onNewLookup={() => setNewLookupOpen(true)}
            notifications={notifications}
            user={user}
            onProfile={() => setProfileOpen(true)}
            onSettings={() => setSettingsOpen(true)}
            onPlans={() => setNav("plans")}
            onBuyCredits={() => setBuyOpen(true)}
            onFaq={() => setFaqOpen(true)}
            onLogout={handleLogout}
          />
          <div style={{ flex:1, minHeight:0, padding:"13px 20px", display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {nav==="email"    && <EmailFinder    key="email" onNav={setNav} setPrefilledEmails={setPrefilledValidationEmails} openJobId={activeJobId} clearOpenJobId={() => setActiveJobId(null)} highlightVal={highlightVal} clearHighlightVal={() => setHighlightVal("")} />}
            {nav==="phone"    && <PhoneFinder    key="phone"   />}
            {nav==="linkedin" && <LinkedInEnrich key="linkedin" openJobId={activeJobId} clearOpenJobId={() => setActiveJobId(null)} highlightVal={highlightVal} clearHighlightVal={() => setHighlightVal("")} />}
            {nav==="validate" && <EmailValidation key="validate" prefilledEmails={prefilledValidationEmails} clearPrefilledEmails={() => setPrefilledValidationEmails("")} openJobId={activeJobId} clearOpenJobId={() => setActiveJobId(null)} highlightVal={highlightVal} clearHighlightVal={() => setHighlightVal("")} />}
            {nav==="plans"    && <PricingSection onSelectPlan={handleSelectPlan} onBack={() => setNav("email")} />}
          </div>
        </div>
        <BuyCreditsModal open={buyOpen} onClose={() => setBuyOpen(false)} onPurchase={handlePurchase}/>
        <FaqModal open={faqOpen} onClose={() => setFaqOpen(false)} />
        <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} token={token} onUpdateUser={(newUser) => setUser(newUser)} />
        <NewLookupModal open={newLookupOpen} onClose={() => setNewLookupOpen(false)} onNav={setNav} />
        <CodeFileModal open={codeViewerOpen} path={selectedFilePath} onClose={() => setCodeViewerOpen(false)} />
      </div>
    </CreditsProvider>
  );
}
