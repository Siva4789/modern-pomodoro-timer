const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, '../src')));

// Basic health check API endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA routing if needed
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../src/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Resource not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
