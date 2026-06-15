const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const ROOT_DIR = path.resolve(__dirname, '../..');

const EXCLUDED = ['node_modules', '.git', 'dist', '.gemini', '.agents'];

router.get('/content', authMiddleware, (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: 'Path parameter is required' });

    const resolvedPath = path.resolve(ROOT_DIR, filePath);
    if (!resolvedPath.startsWith(ROOT_DIR)) return res.status(403).json({ error: 'Access denied' });
    if (!fs.existsSync(resolvedPath)) return res.status(404).json({ error: 'Path not found' });

    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(resolvedPath);
      const items = [];
      for (const file of files) {
        const itemPath = path.join(resolvedPath, file);
        const relativeItemPath = path.relative(ROOT_DIR, itemPath).replace(/\\/g, '/');
        if (EXCLUDED.some(e => relativeItemPath.includes(e))) continue;
        const itemStat = fs.statSync(itemPath);
        items.push({ name: file, path: relativeItemPath, type: itemStat.isDirectory() ? 'folder' : 'file' });
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

module.exports = router;
