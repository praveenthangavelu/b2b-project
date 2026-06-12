// Anymail Finder API client.
// API key lives ONLY here (read from env) and is NEVER sent to the frontend.

const BASE = 'https://api.anymailfinder.com/v5.1';

function apiKey() {
  const key = process.env.ANYMAIL_API_KEY;
  if (!key) throw httpError(500, 'ANYMAIL_API_KEY is not configured on the server');
  return key;
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function call(path, { method = 'POST', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        // Anymail expects the RAW key in Authorization (no "Bearer " prefix).
        Authorization: apiKey(),
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw httpError(502, 'Could not reach Anymail Finder');
  }

  let data = {};
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const msg = data && (data.message || data.error) ? (data.message || data.error)
      : res.status === 401 ? 'Invalid Anymail API key'
      : res.status === 402 ? 'Anymail account is out of credits'
      : res.status === 400 ? 'Invalid input for Anymail'
      : `Anymail request failed (${res.status})`;
    throw httpError(res.status, msg);
  }

  return data;
}

// ─── Result normalizers ──────────────────────────────────────────────────────
// Anymail returns shapes like { success, results: { email, ... }, validation, ... }.
// Extract a single email + a status string defensively across field-name variants.
function normEmail(data) {
  const r = data.results || data;
  const email = r.email || data.email || null;
  const status =
    r.email_status || r.validation || r.status ||
    data.email_status || data.validation || data.status || null;
  return { email, status };
}

function isValid(status) {
  return String(status || '').toLowerCase() === 'valid';
}

// ─── Endpoints ────────────────────────────────────────────────────────────────
async function findPersonEmail({ domain, company_name, full_name, first_name, last_name }) {
  const body = {};
  if (domain) body.domain = domain;
  if (company_name) body.company_name = company_name;
  if (full_name) body.full_name = full_name;
  if (first_name) body.first_name = first_name;
  if (last_name) body.last_name = last_name;
  const data = await call('/find-email/person', { body });
  return { ...normEmail(data), raw: data };
}

async function findCompanyEmails({ domain, company_name }) {
  const body = {};
  if (domain) body.domain = domain;
  if (company_name) body.company_name = company_name;
  const data = await call('/find-email/company', { body });
  const r = data.results || data;
  const emails = r.emails || r.email_list || (r.email ? [r.email] : []);
  return { emails, status: r.email_status || r.status || null, raw: data };
}

async function findDecisionMaker({ domain, company_name, decision_maker_categories }) {
  const body = { decision_maker_categories: decision_maker_categories || ['ceo'] };
  if (domain) body.domain = domain;
  if (company_name) body.company_name = company_name;
  const data = await call('/find-email/decision-maker', { body });
  return { ...normEmail(data), raw: data };
}

async function verifyEmail({ email }) {
  const data = await call('/verify-email', { body: { email } });
  const r = data.results || data;
  const status = r.email_status || r.validation || r.status || data.status || null;
  return { email, status, raw: data };
}

async function getAccount() {
  const data = await call('/account', { method: 'GET' });
  return {
    credits_left: data.credits_left ?? data.credits ?? null,
    email: data.email ?? null,
    raw: data,
  };
}

module.exports = {
  findPersonEmail,
  findCompanyEmails,
  findDecisionMaker,
  verifyEmail,
  getAccount,
  isValid,
};
