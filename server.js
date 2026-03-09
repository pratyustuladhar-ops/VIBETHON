// server.js - Backend for Link Analytics Shortener
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const shortid = require('shortid');
const validUrl = require('valid-url');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const file = path.join(__dirname, 'db.json');
let db = { links: [] };

async function initDB() {
  try {
    const data = await fs.readFile(file, 'utf8');
    db = JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(file, JSON.stringify(db));
    } else {
      console.error('Error reading db.json:', error);
    }
  }
}
initDB();

async function saveDB() {
  await fs.writeFile(file, JSON.stringify(db, null, 2));
}

// POST /api/shorten - create short link
// POST /api/shorten - create short link
app.post('/api/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url || !validUrl.isWebUri(url)) {
    return res.status(400).json({ success: false, error: 'Invalid URL' });
  }
  const code = shortid.generate();
  const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
  const newLink = { 
    id: Date.now(), // script.js uses numeric ids for sorting/deletion
    code: code,
    originalUrl: url, 
    shortUrl: shortUrl,
    clicks: 0,
    createdAt: new Date().toISOString()
  }; 
  db.links.push(newLink);
  await saveDB();
  res.json({ success: true, data: { shortUrl } }); 
});

// GET /api/links - list all links with analytics (legacy support)
app.get('/api/links', async (req, res) => {
  res.json(db.links);
});

// GET /api/urls - list all links with analytics (for script.js)
app.get('/api/urls', async (req, res) => {
  res.json(db.links);
});

// DELETE /api/urls/:id - delete a link
app.delete('/api/urls/:id', async (req, res) => {
  const idToRemove = parseInt(req.params.id);
  const initialLength = db.links.length;
  db.links = db.links.filter(l => l.id !== idToRemove);
  
  if (db.links.length < initialLength) {
    await saveDB();
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Not found' });
  }
});

// GET /:code - redirect and count click
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  const link = db.links.find(l => l.code === code || l.id === code);
  if (!link) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  link.clicks += 1;
  await saveDB();
  res.redirect(link.original);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
