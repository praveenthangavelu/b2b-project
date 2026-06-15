const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Lookup = require('../models/Lookup');
const EnrichHistory = require('../models/EnrichHistory');
const authMiddleware = require('../middleware/auth');
const { timeAgo } = require('../utils/date');

const router = express.Router();
const ROOT_DIR = path.resolve(__dirname, '../..');
const EXCLUDED = ['node_modules', '.git', 'dist', '.gemini', '.agents'];

const UI_SECTIONS_AND_FIELDS = [
  { name: 'Email Finder',                    type: 'section', path: 'Email Finder',                                          target: 'email' },
  { name: 'Phone Finder',                    type: 'section', path: 'Phone Finder',                                          target: 'phone' },
  { name: 'LinkedIn Enrichment',             type: 'section', path: 'LinkedIn Enrichment',                                   target: 'linkedin' },
  { name: 'Email Validation',               type: 'section', path: 'Email Validation',                                      target: 'validate' },
  { name: 'Pricing Plans',                   type: 'section', path: 'Plans > Pricing',                                       target: 'plans' },
  { name: 'Single Email Finder',             type: 'section', path: 'Email Finder > Single Finder',                          target: 'email' },
  { name: 'Bulk Email Finder',               type: 'section', path: 'Email Finder > Bulk Finder',                            target: 'email' },
  { name: 'First Name Input',               type: 'field',   path: 'Email Finder > Single Finder > First Name',             target: 'email',    focus: 'first_name_input' },
  { name: 'Last Name Input',                type: 'field',   path: 'Email Finder > Single Finder > Last Name',              target: 'email',    focus: 'last_name_input' },
  { name: 'Domain Name Input',              type: 'field',   path: 'Email Finder > Single Finder > Domain',                 target: 'email',    focus: 'domain_input' },
  { name: 'Company Name Input',             type: 'field',   path: 'Email Finder > Single Finder > Company Name',           target: 'email',    focus: 'company_name_input' },
  { name: 'Bulk File Upload',               type: 'field',   path: 'Email Finder > Bulk Finder > CSV Upload',               target: 'email' },
  { name: 'Single Phone Finder',             type: 'section', path: 'Phone Finder > Single Finder',                          target: 'phone' },
  { name: 'Bulk Phone Finder',               type: 'section', path: 'Phone Finder > Bulk Finder',                            target: 'phone' },
  { name: 'LinkedIn URL Input',             type: 'field',   path: 'Phone Finder > Single Finder > LinkedIn URL',           target: 'phone',    focus: 'phone_linkedin_input' },
  { name: 'Bulk File Upload',               type: 'field',   path: 'Phone Finder > Bulk Finder > CSV Upload',               target: 'phone' },
  { name: 'Single LinkedIn Enrichment',      type: 'section', path: 'LinkedIn Enrichment > Single',                          target: 'linkedin' },
  { name: 'Bulk LinkedIn Enrichment',        type: 'section', path: 'LinkedIn Enrichment > Bulk',                            target: 'linkedin' },
  { name: 'LinkedIn Profile URL',           type: 'field',   path: 'LinkedIn Enrichment > Single > LinkedIn URL',           target: 'linkedin', focus: 'linkedin_url_input' },
  { name: 'Bulk File Upload',               type: 'field',   path: 'LinkedIn Enrichment > Bulk > CSV Upload',               target: 'linkedin' },
  { name: 'Single Email Validator',          type: 'section', path: 'Email Validation > Single Validator',                   target: 'validate' },
  { name: 'Bulk Email Validator',            type: 'section', path: 'Email Validation > Bulk Validator',                     target: 'validate' },
  { name: 'Email Address Input',            type: 'field',   path: 'Email Validation > Single Validator > Email',           target: 'validate', focus: 'validate_email_input' },
  { name: 'Bulk File Upload',               type: 'field',   path: 'Email Validation > Bulk Validator > CSV Upload',        target: 'validate' },
  { name: 'User Profile details',            type: 'section', path: 'User Menu > Profile',                                   target: 'modal_profile' },
  { name: 'Account Settings / Edit Name',    type: 'section', path: 'User Menu > Settings',                                  target: 'modal_settings' },
  { name: 'FAQ / Help Questions',            type: 'section', path: 'User Menu > Help',                                      target: 'modal_faq' },
  { name: 'Buy Credits Package',             type: 'section', path: 'Sidebar > Buy Credits',                                 target: 'modal_buy' },
  { name: 'New Lookup Modal',                type: 'section', path: 'TopBar > New Lookup',                                   target: 'modal_new_lookup' },
];

function getProjectFiles(dir, allFiles = []) {
  if (!fs.existsSync(dir)) return allFiles;
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    if (EXCLUDED.some(e => relativePath.includes(e))) continue;
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        allFiles.push({ name: file, path: relativePath, type: 'folder' });
        getProjectFiles(filePath, allFiles);
      } else {
        allFiles.push({ name: file, path: relativePath, type: 'file' });
      }
    } catch { /* ignore inaccessible files */ }
  }
  return allFiles;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({ 'Files & Folders': [], 'Sections & Fields': [], 'Email Finder Jobs': [], 'LinkedIn Enrichment Jobs': [], 'Email Verification Jobs': [], 'Job Records & Contacts': [] });
    }

    const regex = new RegExp(q, 'i');
    const isObjectId = mongoose.Types.ObjectId.isValid(q);

    const matchedFiles = getProjectFiles(ROOT_DIR).filter(f =>
      f.name.toLowerCase().includes(q.toLowerCase()) || f.path.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);

    const matchedSections = UI_SECTIONS_AND_FIELDS.filter(s =>
      s.name.toLowerCase().includes(q.toLowerCase()) || s.path.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);

    const lookupConditions = [{ email: regex }, { 'input.domain': regex }, { 'input.company_name': regex }, { 'input.full_name': regex }, { 'input.first_name': regex }, { 'input.last_name': regex }, { 'input.input': regex }];
    if (isObjectId) lookupConditions.push({ _id: new mongoose.Types.ObjectId(q) });
    const lookups = await Lookup.find({ userId: req.userId, $or: lookupConditions }).limit(20);

    const enrichConditions = [{ jobName: regex }, { 'records.inputVal': regex }, { 'records.output.email': regex }, { 'records.output.fullName': regex }, { 'records.output.company': regex }, { 'records.output.phone': regex }, { 'records.output.location': regex }, { 'records.output.companyDomain': regex }];
    if (isObjectId) enrichConditions.push({ _id: new mongoose.Types.ObjectId(q) });
    const histories = await EnrichHistory.find({ userId: req.userId, $or: enrichConditions }).limit(30);

    const emailJobs = [], linkedinJobs = [], validateJobs = [], jobRecords = [];

    for (const history of histories) {
      const isJobMatch = (history.jobName && history.jobName.toLowerCase().includes(q.toLowerCase())) || (history._id.toString() === q);
      const isBulk = history.processingType === 'bulk';
      const label = history.jobName || (isBulk ? 'Bulk Job' : 'Single Job');
      const validCount = history.records ? history.records.filter(r => r.status === 'done' || (r.output && !r.error)).length : 0;
      const pct = history.records && history.records.length > 0 ? Math.round((validCount / history.records.length) * 100) : 100;
      const countText = history.records ? `${history.records.length} records` : '0 records';

      const jobItem = {
        id: history._id.toString(),
        label,
        sub: `${countText} · ${pct}% success · ${timeAgo(history.createdAt)}`,
        icon: isBulk ? '📋' : '✅',
        target: history.module === 'phone' ? 'phone' : (history.module === 'validate' ? 'validate' : history.module),
      };

      if (isJobMatch) {
        if (history.module === 'validate') validateJobs.push(jobItem);
        else if (history.module === 'linkedin') linkedinJobs.push(jobItem);
        else emailJobs.push(jobItem);
      }

      if (history.records) {
        let matchedInThisJob = 0;
        for (const record of history.records) {
          let matchesRecord = record.inputVal && record.inputVal.toLowerCase().includes(q.toLowerCase());
          if (!matchesRecord && record.output) {
            const out = record.output;
            matchesRecord = (out.email && out.email.toLowerCase().includes(q.toLowerCase())) ||
              (out.fullName && out.fullName.toLowerCase().includes(q.toLowerCase())) ||
              (out.company && out.company.toLowerCase().includes(q.toLowerCase())) ||
              (out.phone && out.phone.toLowerCase().includes(q.toLowerCase())) ||
              (out.location && out.location.toLowerCase().includes(q.toLowerCase())) ||
              (out.companyDomain && out.companyDomain.toLowerCase().includes(q.toLowerCase()));
          }
          if (matchesRecord) {
            let recordLabel = record.inputVal || '';
            if (record.output) {
              const out = record.output;
              if (out.fullName && out.email) recordLabel = `${out.fullName} (${out.email})`;
              else if (out.fullName) recordLabel = out.fullName;
              else if (out.email) recordLabel = out.email;
            }
            const moduleName = { validate: 'Verification', linkedin: 'LinkedIn Enrichment', phone: 'Phone Finder' }[history.module] || 'Email Finder';
            jobRecords.push({ id: history._id.toString(), recordVal: record.inputVal || (record.output && (record.output.email || record.output.fullName)), label: recordLabel || 'Unnamed record', sub: `Record in Job: ${label} · ${moduleName}`, icon: '👤', target: history.module === 'phone' ? 'phone' : (history.module === 'validate' ? 'validate' : history.module) });
            if (++matchedInThisJob >= 3) break;
          }
        }
      }
    }

    const lookupRecords = lookups.map(lookup => {
      const label = lookup.input?.full_name || lookup.input?.name || (lookup.email && lookup.email.split('@')[0]) || 'Single lookup';
      const sub = lookup.email ? `${lookup.email} · Single Lookup` : `Single Lookup · ${timeAgo(lookup.createdAt)}`;
      return { id: lookup._id.toString(), label, sub, icon: '👤', target: lookup.type === 'validate' ? 'validate' : (lookup.type.startsWith('linkedin') ? 'linkedin' : 'email'), isSingleLookup: true };
    });

    res.json({
      'Files & Folders': matchedFiles.map(f => ({ label: f.name, path: f.path, icon: f.type === 'folder' ? '📁' : '📄', type: f.type })),
      'Sections & Fields': matchedSections.map(s => ({ label: s.name, path: s.path, target: s.target, focus: s.focus, icon: s.type === 'field' ? '🔤' : '🧭' })),
      'Email Finder Jobs': emailJobs.slice(0, 5),
      'LinkedIn Enrichment Jobs': linkedinJobs.slice(0, 5),
      'Email Verification Jobs': validateJobs.slice(0, 5),
      'Job Records & Contacts': [...jobRecords, ...lookupRecords].slice(0, 10),
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
