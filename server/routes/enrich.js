const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Lookup = require('../models/Lookup');
const anymail = require('../services/anymail');
const b2b = require('../services/b2bEnrich');
const EnrichHistory = require('../models/EnrichHistory');
const Notification = require('../models/Notification');

const router = express.Router();

// All enrich routes require a valid JWT.
router.use(authMiddleware);

const COST = { person: 1, company: 1, 'decision-maker': 2, validate: 0, linkedin: 5 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LI_URL_RE = /linkedin\.com\/(in|company)\//i;

const LI_FIELDS_ALLOW = new Set([
  'fullName', 'headline', 'type', 'company', 'location', 'industry', 'jobTitle',
  'email', 'skills', 'workHistory', 'education', 'companyDomain',
]);

function pickFields(obj, fields) {
  const src = obj || {};
  const out = {};
  for (const k of fields || []) out[k] = src[k];
  return out;
}

function getCleanDomain(str) {
  if (!str) return '';
  const trimmed = str.trim();
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `http://${trimmed}`);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return trimmed;
  }
}

// Block up-front if the user can't afford the (max) cost of the call.
async function requireCredits(req, res, cost) {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  if (cost > 0 && (user.credits || 0) < cost) {
    res.status(402).json({ error: 'Out of credits', credits: user.credits || 0 });
    return null;
  }
  return user;
}

// Charge credits + write history only when a valid email was found.
async function charge(user, { type, input, email, status, result }) {
  const valid = anymail.isValid(status);
  const creditsCharged = valid ? (COST[type] || 0) : 0;

  if (creditsCharged > 0) {
    user.credits = Math.max(0, (user.credits || 0) - creditsCharged);
    user.creditsUsed = (user.creditsUsed || 0) + creditsCharged;
    await user.save();
  }

  await Lookup.create({
    userId: user._id, type, input, email: email || null,
    status: status || null, result, creditsCharged,
  });

  return creditsCharged;
}

function sendErr(res, err) {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
}

// POST /api/enrich/email  — person email finder (1 credit on valid)
router.post('/email', async (req, res) => {
  try {
    const { domain, company_name, full_name, first_name, last_name } = req.body || {};
    if (!domain && !company_name) {
      return res.status(400).json({ error: 'Provide domain or company_name' });
    }
    if (!full_name && !(first_name && last_name)) {
      return res.status(400).json({ error: 'Provide full_name or first_name + last_name' });
    }

    const user = await requireCredits(req, res, COST.person);
    if (!user) return;

    const out = await anymail.findPersonEmail({ domain, company_name, full_name, first_name, last_name });
    const creditsCharged = await charge(user, {
      type: 'person',
      input: { domain, company_name, full_name, first_name, last_name },
      email: out.email, status: out.status, result: { email: out.email, status: out.status },
    });

    res.json({
      email: out.email,
      status: out.status,
      found: anymail.isValid(out.status),
      creditsCharged,
      credits: user.credits,
      creditsUsed: user.creditsUsed,
    });
  } catch (err) { sendErr(res, err); }
});

// POST /api/enrich/company — up to 20 emails (1 credit on valid)
router.post('/company', async (req, res) => {
  try {
    const { domain, company_name } = req.body || {};
    if (!domain && !company_name) {
      return res.status(400).json({ error: 'Provide domain or company_name' });
    }

    const user = await requireCredits(req, res, COST.company);
    if (!user) return;

    const out = await anymail.findCompanyEmails({ domain, company_name });
    const found = out.emails && out.emails.length > 0;
    const status = found ? (out.status || 'valid') : (out.status || 'not_found');
    const creditsCharged = await charge(user, {
      type: 'company',
      input: { domain, company_name },
      email: out.emails && out.emails[0], status,
      result: { emails: out.emails },
    });

    res.json({
      emails: out.emails || [],
      status,
      found,
      creditsCharged,
      credits: user.credits,
      creditsUsed: user.creditsUsed,
    });
  } catch (err) { sendErr(res, err); }
});

// POST /api/enrich/decision-maker — (2 credits on valid)
router.post('/decision-maker', async (req, res) => {
  try {
    const { domain, company_name, decision_maker_categories } = req.body || {};
    if (!domain && !company_name) {
      return res.status(400).json({ error: 'Provide domain or company_name' });
    }

    const user = await requireCredits(req, res, COST['decision-maker']);
    if (!user) return;

    const out = await anymail.findDecisionMaker({ domain, company_name, decision_maker_categories });
    const creditsCharged = await charge(user, {
      type: 'decision-maker',
      input: { domain, company_name, decision_maker_categories },
      email: out.email, status: out.status, result: { email: out.email, status: out.status },
    });

    res.json({
      email: out.email,
      status: out.status,
      found: anymail.isValid(out.status),
      creditsCharged,
      credits: user.credits,
      creditsUsed: user.creditsUsed,
    });
  } catch (err) { sendErr(res, err); }
});

// POST /api/enrich/validate — verify email (free per brief)
router.post('/validate', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Provide email' });

    const user = await requireCredits(req, res, COST.validate);
    if (!user) return;

    const out = await anymail.verifyEmail({ email });
    await Lookup.create({
      userId: user._id, type: 'validate', input: { email },
      email, status: out.status || null, result: { status: out.status }, creditsCharged: 0,
    });

    res.json({
      email,
      status: out.status,
      credits: user.credits,
      creditsUsed: user.creditsUsed,
    });
  } catch (err) { sendErr(res, err); }
});

// GET /api/enrich/account — Anymail account balance (free)
router.get('/account', async (req, res) => {
  try {
    const out = await anymail.getAccount();
    res.json({ credits_left: out.credits_left, email: out.email });
  } catch (err) { sendErr(res, err); }
});

// POST /api/enrich/linkedin — LinkedIn / email enrichment via B2B Enrichment (5 credits on success)
// Body: { input, type, fields } where input is email OR linkedin URL. fields must be allow-listed keys.
router.post('/linkedin', async (req, res) => {
  try {
    const input = (req.body && req.body.input ? String(req.body.input) : '').trim();
    if (!input) return res.status(400).json({ error: 'Provide an email or LinkedIn URL' });

    const isEmail = EMAIL_RE.test(input);
    const isLinkedIn = LI_URL_RE.test(input);
    if (!isEmail && !isLinkedIn) {
      return res.status(400).json({ error: 'Enter a valid email or LinkedIn /in/ or /company/ URL' });
    }

    const fields = Array.isArray(req.body && req.body.fields) ? req.body.fields : null;
    if (!fields || fields.length === 0) return res.status(400).json({ error: 'fields must be a non-empty array' });
    for (const f of fields) {
      if (!LI_FIELDS_ALLOW.has(f)) return res.status(400).json({ error: `Unknown field: ${String(f)}` });
    }

    const inferredType = isEmail ? 'person' : (/linkedin\.com\/company\//i.test(input) ? 'company' : 'person');
    const user = await requireCredits(req, res, COST.linkedin);
    if (!user) return;

    // Simple server-side cache: reuse latest prior lookup for same input (any user), no charge.
    const lookupType = inferredType === 'company' ? 'linkedin-company' : 'linkedin';
    const cachedLookup = await Lookup.findOne({ type: lookupType, 'input.input': input }).sort({ createdAt: -1 });
    if (cachedLookup && cachedLookup.result) {
      const cachedFields = new Set(cachedLookup.input.fields || []);
      const hasAllFields = fields.every(f => cachedFields.has(f));
      if (hasAllFields) {
        const pickKeys = [...fields];
        if (!pickKeys.includes('linkedinUrl')) pickKeys.push('linkedinUrl');
        const data = pickFields(cachedLookup.result, pickKeys);
        if (req.body.isBulk) {
          if (!fields.includes('email')) delete data.email;
          if (!fields.includes('companyDomain')) delete data.companyDomain;
          if (!fields.includes('website')) delete data.website;
        }
        return res.json({
          data,
          meta: { creditsCharged: 0, balanceRemaining: user.credits || 0, cached: true },
        });
      }
    }

    let profile;
    try {
      profile = isEmail ? await b2b.reverseLookup(input) : await b2b.enrichProfile(input);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ error: err.message || 'Enrichment failed' });
    }

    if (isEmail) {
      profile.email = input;
    } else if (fields.includes('email')) {
      try {
        if (inferredType === 'person') {
          const domain = getCleanDomain(profile.companyDomain);
          const out = await anymail.findPersonEmail({
            domain: domain || undefined,
            company_name: domain ? undefined : (profile.company || undefined),
            full_name: profile.fullName,
          });
          if (out && out.email) {
            profile.email = out.email;
          }
        } else if (inferredType === 'company') {
          const domain = getCleanDomain(profile.website);
          const out = await anymail.findCompanyEmails({
            domain: domain || undefined,
            company_name: domain ? undefined : (profile.company || undefined),
          });
          if (out && out.emails && out.emails.length > 0) {
            profile.email = out.emails[0];
          }
        }
      } catch (err) {
        console.warn('Anymail Finder lookup failed during LinkedIn enrichment:', err.message);
      }
    }

    // Success, non-cached → charge 5.
    user.credits = Math.max(0, (user.credits || 0) - COST.linkedin);
    user.creditsUsed = (user.creditsUsed || 0) + COST.linkedin;
    await user.save();

    await Lookup.create({
      userId: user._id,
      type: lookupType,
      input: { input, fields },
      email: isEmail ? input : (profile.email || null),
      status: 'enriched',
      result: profile,
      creditsCharged: COST.linkedin,
    });

    const pickKeys = [...fields];
    if (!pickKeys.includes('linkedinUrl')) pickKeys.push('linkedinUrl');
    const data = pickFields(profile, pickKeys);
    if (req.body.isBulk) {
      if (!fields.includes('email')) delete data.email;
      if (!fields.includes('companyDomain')) delete data.companyDomain;
      if (!fields.includes('website')) delete data.website;
    }
    res.json({
      data,
      meta: { creditsCharged: COST.linkedin, balanceRemaining: user.credits || 0, cached: false },
    });
  } catch (err) { sendErr(res, err); }
});

// POST /api/enrich/find-email — Anymail Finder by name+domain (person) or domain-only (company).
// Returns { email, confidence }. Charges like the other paid lookups (only on a valid hit).
router.post('/find-email', async (req, res) => {
  try {
    const { name, domain } = req.body || {};
    if (!domain) return res.status(400).json({ error: 'Provide a company domain' });

    const companyOnly = !name || !String(name).trim();
    const type = companyOnly ? 'company' : 'person';

    const user = await requireCredits(req, res, COST[type]);
    if (!user) return;

    let email = null, status = null, result = {};
    if (companyOnly) {
      const out = await anymail.findCompanyEmails({ domain });
      email = (out.emails && out.emails[0]) || null;
      status = email ? (out.status || 'valid') : (out.status || 'not_found');
      result = { emails: out.emails };
    } else {
      const out = await anymail.findPersonEmail({ domain, full_name: String(name).trim() });
      email = out.email; status = out.status;
      result = { email, status };
    }

    // charge() only deducts when the status is valid; always logs the lookup.
    const creditsCharged = await charge(user, { type, input: { name, domain }, email, status, result });

    if (!email || !anymail.isValid(status)) {
      return res.status(404).json({ error: 'No email found', status, credits: user.credits });
    }

    const confidence = status === 'valid' ? 'high'
      : (['risky', 'catch_all', 'accept_all', 'unknown'].includes(String(status).toLowerCase()) ? 'medium' : 'low');

    res.json({ email, confidence, status, creditsCharged, credits: user.credits, creditsUsed: user.creditsUsed });
  } catch (err) { sendErr(res, err); }
});

// GET /api/enrich/provider-credits — B2B Enrichment account balance (free)
router.get('/provider-credits', async (req, res) => {
  try {
    const out = await b2b.getProviderCredits();
    res.json({ total: out.total });
  } catch (err) { sendErr(res, err); }
});

// POST /api/enrich/history — Save a new enrichment history record
router.post('/history', async (req, res) => {
  try {
    const { processingType, records, fields, jobName, module } = req.body || {};
    if (!processingType || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid history payload' });
    }
    const sanitizedRecords = processingType === 'bulk'
      ? records.map(r => ({ ...r, inputVal: "" }))
      : records;

    const activeModule = module || 'linkedin';

    let finalJobName = (jobName || '').trim();
    if (!finalJobName) {
      const d = new Date();
      const day = d.getDate();
      const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthName = allMonths[d.getMonth()];
      const year = d.getFullYear();
      if (activeModule === 'email') {
        finalJobName = `Email Finder – ${day} ${monthName} ${year}`;
      } else if (activeModule === 'validate') {
        finalJobName = `Email Verification – ${day} ${monthName} ${year}`;
      } else {
        finalJobName = `LinkedIn Enrichment – ${day} ${monthName} ${year}`;
      }
    }

    const history = await EnrichHistory.create({
      userId: req.userId,
      module: activeModule,
      processingType,
      records: sanitizedRecords,
      fields: fields || [],
      jobName: finalJobName,
    });

    // Create a dynamic notification
    const totalCount = records.length;
    const successCount = records.filter(r => r.status === 'done' || (r.output && !r.error)).length;
    let title = '';
    if (processingType === 'bulk') {
      const moduleName = activeModule === 'validate' ? 'validation' : (activeModule === 'email' ? 'email finder' : 'LinkedIn enrichment');
      title = `Bulk ${moduleName} finished — ${totalCount} records (${successCount} successful)`;
    } else {
      const inputVal = records[0]?.inputVal || '';
      const previewText = inputVal ? ` for "${inputVal}"` : '';
      title = `${activeModule.charAt(0).toUpperCase() + activeModule.slice(1)} completed${previewText}`;
    }

    await Notification.create({
      userId: req.userId,
      title,
      target: activeModule
    });

    res.status(201).json(history);
  } catch (err) { sendErr(res, err); }
});

// GET /api/enrich/history — Fetch all history records for the user (without heavy outputs)
router.get('/history', async (req, res) => {
  try {
    const query = { userId: req.userId };
    if (req.query.module) {
      if (req.query.module === 'linkedin') {
        query.$or = [
          { module: 'linkedin' },
          { module: { $exists: false } }
        ];
      } else {
        query.module = req.query.module;
      }
    }
    const histories = await EnrichHistory.find(query)
      .sort({ createdAt: -1 });
    res.json(histories);
  } catch (err) { sendErr(res, err); }
});

// GET /api/enrich/history/:id — Load a specific previous result by ID
router.get('/history/:id', async (req, res) => {
  try {
    const history = await EnrichHistory.findOne({ _id: req.params.id, userId: req.userId });
    if (!history) {
      return res.status(404).json({ error: 'History record not found' });
    }
    res.json(history);
  } catch (err) { sendErr(res, err); }
});

// DELETE /api/enrich/history/:id — Permanently delete a single history record
router.delete('/history/:id', async (req, res) => {
  try {
    const result = await EnrichHistory.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'History record not found' });
    }
    res.json({ success: true });
  } catch (err) { sendErr(res, err); }
});

// DELETE /api/enrich/history — Permanently delete multiple history records
router.delete('/history', async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Provide an array of ids to delete' });
    }
    await EnrichHistory.deleteMany({ _id: { $in: ids }, userId: req.userId });
    res.json({ success: true });
  } catch (err) { sendErr(res, err); }
});

module.exports = router;
