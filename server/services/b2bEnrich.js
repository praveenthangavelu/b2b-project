// B2B Enrichment API client.
// API key lives ONLY here (process.env.ENRICH_API_KEY) and is NEVER sent to the frontend.

const BASE = 'https://app.b2b-enrichment.com/api/b2b-enrichment';

function apiKey() {
  const key = process.env.ENRICH_API_KEY;
  if (!key) throw httpError(500, 'ENRICH_API_KEY is not configured on the server');
  return key;
}

function httpError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  if (code) err.code = code;
  return err;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function call(path, { method = 'POST', body } = {}) {
  let res;
  // Retry transient gateway errors (502/503/504) — the provider occasionally blips.
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          'X-TOKEN': apiKey(),          // B2B Enrichment uses raw X-TOKEN (not Bearer).
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      if (attempt < 2) { await sleep(800 * (attempt + 1)); continue; }
      throw httpError(502, 'Could not reach the enrichment service');
    }
    if ([502, 503, 504].includes(res.status) && attempt < 2) { await sleep(800 * (attempt + 1)); continue; }
    break;
  }

  let data = {};
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const raw = String((data && data.error) || '').toLowerCase();
    // Documented error mapping.
    if (raw.includes('token not found')) throw httpError(401, 'Invalid API key', 'BAD_KEY');
    if (raw.includes('profile not found') || raw.includes('not found')) throw httpError(404, 'Profile not found', 'NOT_FOUND');
    if (res.status === 402 || raw.includes("don't have enough credit") || raw.includes('not enough credit')) {
      throw httpError(402, 'Enrichment service is out of credits', 'PROVIDER_NO_CREDIT');
    }
    throw httpError(res.status, (data && data.error) || `Enrichment request failed (${res.status})`);
  }

  return data;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────
function locationString(loc) {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.join(', ') || loc.defaultValue || '';
}

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.map(s => (typeof s === 'string' ? s : (s && (s.name || s.title)) || '')).filter(Boolean).slice(0, 25);
}

function normalizePerson(d, linkedinUrl) {
  const fullName = [d.firstname, d.lastname].filter(Boolean).join(' ').trim();
  let jobTitle = d.headline || '';
  let company = '';
  const pg = Array.isArray(d.positionGroups) ? d.positionGroups[0] : null;
  const pos = pg && Array.isArray(pg.profilePositions) ? pg.profilePositions[0] : null;
  if (pos) {
    jobTitle = pos.title || jobTitle;
    company = (pos.company && pos.company.name) || (pg.company && pg.company.name) || company;
  }
  const companyDomain = (pg && pg.company && pg.company.domain) || (pos && pos.company && pos.company.domain) || '';
  return {
    type: 'person',
    fullName: fullName || d.headline || 'Unknown',
    headline: d.headline || '',
    jobTitle: jobTitle || '',
    company: company || '',
    companyDomain: companyDomain || '',
    location: locationString(d.location),
    industry: d.industry || '',
    photo: d.picture || '',
    skills: normalizeSkills(d.skills),
    linkedinUrl: linkedinUrl || d.linkedinUrl || '',
    education: (d.educations || []).map(e => ({
      school: (typeof e.school === 'string' ? e.school : e.school?.name) || e.schoolName || '',
      degree: e.degreeName || e.degree || '',
      field:  e.fieldOfStudy || e.field || '',
      start:  e.date?.start || e.dateRange?.start || e.startDate || null,
      end:    e.date?.end   || e.dateRange?.end   || e.endDate   || null,
    })),
    jobHistory: (d.positionGroups || []).flatMap(g =>
      (g.profilePositions || []).map(p => ({
        title:   p.title || '',
        company: (typeof p.company === 'string' ? p.company : p.company?.name) || g.company?.name || '',
        start:   p.date?.start || p.dateRange?.start || p.startDate || null,
        end:     p.date?.end   || p.dateRange?.end   || p.endDate   || null,
      }))
    ),
    // Alias for field-selection API (do not remove jobHistory).
    workHistory: (d.positionGroups || []).flatMap(g =>
      (g.profilePositions || []).map(p => ({
        title:   p.title || '',
        company: (typeof p.company === 'string' ? p.company : p.company?.name) || g.company?.name || '',
        start:   p.date?.start || p.dateRange?.start || p.startDate || null,
        end:     p.date?.end   || p.dateRange?.end   || p.endDate   || null,
      }))
    ),
    raw: d,
  };
}

function normalizeCompany(d, linkedinUrl) {
  const hq = d.locations && d.locations.headquarter;
  const industry = Array.isArray(d.industries) ? d.industries.filter(Boolean).join(', ')
    : (d.industry || '');
  return {
    type: 'company',
    fullName: d.name || 'Unknown company',
    headline: d.tagline || '',
    jobTitle: industry,
    company: d.name || '',
    location: locationString(hq),
    industry,
    photo: d.logo || '',
    skills: Array.isArray(d.specialities) ? d.specialities.filter(Boolean).slice(0, 25) : [],
    linkedinUrl: linkedinUrl || '',
    website: d.website || '',
    companyDomain: d.website || '',
    staffTotal: (d.staff && (d.staff.total ?? d.staff)) || null,
    description: d.description || '',
    logo:         d.logo || '',
    headcount:    d.staff?.total ?? null,
    headquarter:  d.locations?.headquarter || null,
    industries:   d.industries || [],
    specialities: d.specialities || [],
    raw: d,
  };
}

function looksLikeCompany(url) {
  return /linkedin\.com\/company\//i.test(url || '');
}

// ─── Endpoints ────────────────────────────────────────────────────────────────
// Strip tracking query strings / fragments (e.g. ?lipi=...) — the provider rejects messy URLs.
function cleanProfileUrl(u) {
  const raw = String(u || '').trim();
  try {
    const x = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return `${x.protocol}//${x.host}${x.pathname}`.replace(/\/+$/, '');
  } catch {
    return raw.split('?')[0].split('#')[0].replace(/\/+$/, '');
  }
}

async function enrichProfile(url) {
  const clean = cleanProfileUrl(url);
  const data = await call('/profiles', { body: { url: clean, useCache: true } });
  return looksLikeCompany(clean) ? normalizeCompany(data, clean) : normalizePerson(data, clean);
}

async function reverseLookup(email) {
  const data = await call('/people/reverse-lookup', { body: { kind: 'CONTACT', search: email } });
  // Reverse lookup may return a single profile, a wrapped object, or an array of matches.
  const candidate = Array.isArray(data) ? data[0]
    : (Array.isArray(data.results) ? data.results[0]
      : (data.profile || data.person || data));
  if (!candidate || (typeof candidate === 'object' && Object.keys(candidate).length === 0)) {
    throw httpError(404, 'Profile not found', 'NOT_FOUND');
  }
  const person = normalizePerson(candidate, candidate.linkedinUrl || candidate.profileUrl || '');
  if (!person.fullName || person.fullName === 'Unknown') {
    // Some reverse responses embed the contact email back; keep what we can.
    person.fullName = person.fullName || (candidate.fullName || email);
  }
  return person;
}

async function getProviderCredits() {
  const data = await call('/credits', { method: 'GET' });
  return { total: typeof data.total === 'number' ? data.total : (data.credits ?? null) };
}

module.exports = { enrichProfile, reverseLookup, getProviderCredits, looksLikeCompany };
