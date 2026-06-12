require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const { connectDB } = require('./db');
const User = require('./models/User');
const Lookup = require('./models/Lookup');
const EnrichHistory = require('./models/EnrichHistory');
const Notification = require('./models/Notification');
const authMiddleware = require('./middleware/auth');
const enrichRoutes = require('./routes/enrich');
const creditsRoutes = require('./routes/credits');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    credits: user.credits,
    creditsUsed: user.creditsUsed,
    createdAt: user.createdAt
  };
}

function signToken(userId) {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash
    });

    await Notification.create({
      userId: user._id,
      title: 'Welcome to Prospecto! Get started with 10,000 free credits.',
      target: null
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Wrong password' });
    }

    const token = signToken(user._id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/update', authMiddleware, async (req, res) => {
  try {
    const { name, password, plan } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (name) {
      user.name = name.trim();
    }
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    if (plan) {
      user.plan = plan;
    }
    await user.save();
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/enrich', enrichRoutes);
app.use('/api/credits', creditsRoutes);

// Time-ago helper for search/notification previews
// Helper to recursively scan workspace files and folders (excluding build/deps/hidden)
function getProjectFiles(dir, allFiles = []) {
  if (!fs.existsSync(dir)) return allFiles;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const rootDir = path.resolve(__dirname, '..');
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    
    if (
      relativePath.includes('node_modules') ||
      relativePath.includes('.git') ||
      relativePath.includes('dist') ||
      relativePath.includes('.gemini') ||
      relativePath.includes('.agents')
    ) {
      continue;
    }
    
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        allFiles.push({ name: file, path: relativePath, type: 'folder' });
        getProjectFiles(filePath, allFiles);
      } else {
        allFiles.push({ name: file, path: relativePath, type: 'file' });
      }
    } catch (e) {
      // Ignore files we cannot access
    }
  }
  return allFiles;
}

const UI_SECTIONS_AND_FIELDS = [
  // Navigation tabs
  { name: "Email Finder", type: "section", path: "Email Finder", target: "email" },
  { name: "Phone Finder", type: "section", path: "Phone Finder", target: "phone" },
  { name: "LinkedIn Enrichment", type: "section", path: "LinkedIn Enrichment", target: "linkedin" },
  { name: "Email Validation", type: "section", path: "Email Validation", target: "validate" },
  { name: "Pricing Plans", type: "section", path: "Plans > Pricing", target: "plans" },
  
  // Email Finder Sections & Fields
  { name: "Single Email Finder", type: "section", path: "Email Finder > Single Finder", target: "email" },
  { name: "Bulk Email Finder", type: "section", path: "Email Finder > Bulk Finder", target: "email" },
  { name: "First Name Input", type: "field", path: "Email Finder > Single Finder > First Name", target: "email", focus: "first_name_input" },
  { name: "Last Name Input", type: "field", path: "Email Finder > Single Finder > Last Name", target: "email", focus: "last_name_input" },
  { name: "Domain Name Input", type: "field", path: "Email Finder > Single Finder > Domain", target: "email", focus: "domain_input" },
  { name: "Company Name Input", type: "field", path: "Email Finder > Single Finder > Company Name", target: "email", focus: "company_name_input" },
  { name: "Bulk File Upload", type: "field", path: "Email Finder > Bulk Finder > CSV Upload", target: "email" },
  
  // Phone Finder Sections & Fields
  { name: "Single Phone Finder", type: "section", path: "Phone Finder > Single Finder", target: "phone" },
  { name: "Bulk Phone Finder", type: "section", path: "Phone Finder > Bulk Finder", target: "phone" },
  { name: "LinkedIn URL Input", type: "field", path: "Phone Finder > Single Finder > LinkedIn URL", target: "phone", focus: "phone_linkedin_input" },
  { name: "Bulk File Upload", type: "field", path: "Phone Finder > Bulk Finder > CSV Upload", target: "phone" },
  
  // LinkedIn Enrichment Sections & Fields
  { name: "Single LinkedIn Enrichment", type: "section", path: "LinkedIn Enrichment > Single", target: "linkedin" },
  { name: "Bulk LinkedIn Enrichment", type: "section", path: "LinkedIn Enrichment > Bulk", target: "linkedin" },
  { name: "LinkedIn Profile URL", type: "field", path: "LinkedIn Enrichment > Single > LinkedIn URL", target: "linkedin", focus: "linkedin_url_input" },
  { name: "Bulk File Upload", type: "field", path: "LinkedIn Enrichment > Bulk > CSV Upload", target: "linkedin" },
  
  // Email Validation Sections & Fields
  { name: "Single Email Validator", type: "section", path: "Email Validation > Single Validator", target: "validate" },
  { name: "Bulk Email Validator", type: "section", path: "Email Validation > Bulk Validator", target: "validate" },
  { name: "Email Address Input", type: "field", path: "Email Validation > Single Validator > Email", target: "validate", focus: "validate_email_input" },
  { name: "Bulk File Upload", type: "field", path: "Email Validation > Bulk Validator > CSV Upload", target: "validate" },
  
  // Modals & Menu items
  { name: "User Profile details", type: "section", path: "User Menu > Profile", target: "modal_profile" },
  { name: "Account Settings / Edit Name", type: "section", path: "User Menu > Settings", target: "modal_settings" },
  { name: "FAQ / Help Questions", type: "section", path: "User Menu > Help", target: "modal_faq" },
  { name: "Buy Credits Package", type: "section", path: "Sidebar > Buy Credits", target: "modal_buy" },
  { name: "New Lookup Modal", type: "section", path: "TopBar > New Lookup", target: "modal_new_lookup" }
];

// Time-ago helper for search/notification previews
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// GET /api/search - Unified Search endpoint for Codebase, App Navigation, Lookups, Contacts, and Jobs
app.get('/api/search', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({
        "Files & Folders": [],
        "Sections & Fields": [],
        "Email Finder Jobs": [],
        "LinkedIn Enrichment Jobs": [],
        "Email Verification Jobs": [],
        "Job Records & Contacts": []
      });
    }

    const regex = new RegExp(q, 'i');
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(q);

    // 1. Codebase Search
    const rootDir = path.resolve(__dirname, '..');
    const allFiles = getProjectFiles(rootDir);
    const matchedFiles = allFiles.filter(f => 
      f.name.toLowerCase().includes(q.toLowerCase()) ||
      f.path.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);

    // 2. Sections & Fields Search
    const matchedSections = UI_SECTIONS_AND_FIELDS.filter(s => 
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.path.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);

    // 3. Search Lookups (from DB)
    const lookupConditions = [
      { email: regex },
      { 'input.domain': regex },
      { 'input.company_name': regex },
      { 'input.full_name': regex },
      { 'input.first_name': regex },
      { 'input.last_name': regex },
      { 'input.input': regex }
    ];
    if (isObjectId) {
      lookupConditions.push({ _id: new mongoose.Types.ObjectId(q) });
    }
    const lookups = await Lookup.find({
      userId: req.userId,
      $or: lookupConditions
    }).limit(20);

    // 4. Search EnrichHistory (from DB)
    const enrichConditions = [
      { jobName: regex },
      { 'records.inputVal': regex },
      { 'records.output.email': regex },
      { 'records.output.fullName': regex },
      { 'records.output.company': regex },
      { 'records.output.phone': regex },
      { 'records.output.location': regex },
      { 'records.output.companyDomain': regex }
    ];
    if (isObjectId) {
      enrichConditions.push({ _id: new mongoose.Types.ObjectId(q) });
    }
    const histories = await EnrichHistory.find({
      userId: req.userId,
      $or: enrichConditions
    }).limit(30);

    const emailJobs = [];
    const linkedinJobs = [];
    const validateJobs = [];
    const jobRecords = [];

    for (const history of histories) {
      const isJobMatch = (history.jobName && history.jobName.toLowerCase().includes(q.toLowerCase())) ||
                         (history._id.toString() === q);
      const isBulk = history.processingType === 'bulk';
      const label = history.jobName || (isBulk ? 'Bulk Job' : 'Single Job');
      const validCount = history.records ? history.records.filter(r => r.status === 'done' || (r.output && !r.error)).length : 0;
      const pct = history.records && history.records.length > 0 ? Math.round((validCount / history.records.length) * 100) : 100;
      const countText = history.records ? `${history.records.length} records` : '0 records';

      const jobItem = {
        id: history._id.toString(),
        label: label,
        sub: `${countText} · ${pct}% success · ${timeAgo(history.createdAt)}`,
        icon: isBulk ? "📋" : "✅",
        target: history.module === 'phone' ? 'phone' : (history.module === 'validate' ? 'validate' : history.module)
      };

      if (isJobMatch) {
        if (history.module === 'validate') {
          validateJobs.push(jobItem);
        } else if (history.module === 'linkedin') {
          linkedinJobs.push(jobItem);
        } else {
          emailJobs.push(jobItem);
        }
      }

      // Check records
      if (history.records) {
        let matchedInThisJob = 0;
        for (const record of history.records) {
          let matchesRecord = false;
          if (record.inputVal && record.inputVal.toLowerCase().includes(q.toLowerCase())) {
            matchesRecord = true;
          } else if (record.output) {
            const out = record.output;
            if (
              (out.email && out.email.toLowerCase().includes(q.toLowerCase())) ||
              (out.fullName && out.fullName.toLowerCase().includes(q.toLowerCase())) ||
              (out.company && out.company.toLowerCase().includes(q.toLowerCase())) ||
              (out.phone && out.phone.toLowerCase().includes(q.toLowerCase())) ||
              (out.location && out.location.toLowerCase().includes(q.toLowerCase())) ||
              (out.companyDomain && out.companyDomain.toLowerCase().includes(q.toLowerCase()))
            ) {
              matchesRecord = true;
            }
          }

          if (matchesRecord) {
            let recordLabel = record.inputVal || '';
            if (record.output) {
              const out = record.output;
              if (out.fullName && out.email) {
                recordLabel = `${out.fullName} (${out.email})`;
              } else if (out.fullName) {
                recordLabel = out.fullName;
              } else if (out.email) {
                recordLabel = out.email;
              }
            }
            if (!recordLabel) recordLabel = "Unnamed record";

            const moduleName = history.module === 'validate' ? 'Verification' :
                               history.module === 'linkedin' ? 'LinkedIn Enrichment' :
                               history.module === 'phone' ? 'Phone Finder' : 'Email Finder';

            jobRecords.push({
              id: history._id.toString(),
              recordVal: record.inputVal || (record.output && (record.output.email || record.output.fullName)),
              label: recordLabel,
              sub: `Record in Job: ${label} · ${moduleName}`,
              icon: "👤",
              target: history.module === 'phone' ? 'phone' : (history.module === 'validate' ? 'validate' : history.module)
            });

            matchedInThisJob++;
            if (matchedInThisJob >= 3) break;
          }
        }
      }
    }

    const lookupRecords = [];
    for (const lookup of lookups) {
      let label = '';
      if (lookup.input?.full_name) {
        label = lookup.input.full_name;
      } else if (lookup.input?.name) {
        label = lookup.input.name;
      } else if (lookup.email) {
        label = lookup.email.split('@')[0];
      } else {
        label = 'Single lookup';
      }

      const sub = lookup.email ? `${lookup.email} · Single Lookup` : `Single Lookup · ${timeAgo(lookup.createdAt)}`;
      lookupRecords.push({
        id: lookup._id.toString(),
        label: label,
        sub: sub,
        icon: "👤",
        target: lookup.type === 'validate' ? 'validate' : (lookup.type.startsWith('linkedin') ? 'linkedin' : 'email'),
        isSingleLookup: true
      });
    }

    const unifiedRecords = [...jobRecords, ...lookupRecords].slice(0, 10);

    res.json({
      "Files & Folders": matchedFiles.map(f => ({
        label: f.name,
        path: f.path,
        icon: f.type === 'folder' ? "📁" : "📄",
        type: f.type
      })),
      "Sections & Fields": matchedSections.map(s => ({
        label: s.name,
        path: s.path,
        target: s.target,
        focus: s.focus,
        icon: s.type === 'field' ? "🔤" : "🧭"
      })),
      "Email Finder Jobs": emailJobs.slice(0, 5),
      "LinkedIn Enrichment Jobs": linkedinJobs.slice(0, 5),
      "Email Verification Jobs": validateJobs.slice(0, 5),
      "Job Records & Contacts": unifiedRecords
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/files/content - Securely read file content or list folder items in local workspace
app.get('/api/files/content', authMiddleware, async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const rootDir = path.resolve(__dirname, '..');
    const resolvedPath = path.resolve(rootDir, filePath);

    // Prevent directory traversal attacks
    if (!resolvedPath.startsWith(rootDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }

    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(resolvedPath);
      const items = [];
      for (const file of files) {
        const itemPath = path.join(resolvedPath, file);
        const relativeItemPath = path.relative(rootDir, itemPath).replace(/\\/g, '/');
        
        // Ignore build/hidden directories inside folder listing
        if (
          relativeItemPath.includes('node_modules') ||
          relativeItemPath.includes('.git') ||
          relativeItemPath.includes('dist') ||
          relativeItemPath.includes('.gemini') ||
          relativeItemPath.includes('.agents')
        ) {
          continue;
        }
        
        const itemStat = fs.statSync(itemPath);
        items.push({
          name: file,
          path: relativeItemPath,
          type: itemStat.isDirectory() ? 'folder' : 'file'
        });
      }
      return res.json({ type: 'folder', items });
    }

    const content = fs.readFileSync(resolvedPath, 'utf8');
    res.json({ type: 'file', content });
  } catch (err) {
    console.error('Read file content error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/notifications - Get all user notifications
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/notifications/:id/read - Mark notification as read
app.post('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, userId: req.userId }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Read notification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/notifications/read-all - Mark all notifications as read
app.post('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Read-all notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
