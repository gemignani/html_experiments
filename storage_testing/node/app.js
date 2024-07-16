const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 4000;

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  console.log('GET /');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/info', (req, res) => {
  console.log('GET /info');
  console.log('Received Cookies:', req.cookies);
  
  // Set a cookie
  res.cookie('info_seen', 'yes', { expires: new Date(Date.now() + 900000), httpOnly: true });
  
  res.sendFile(path.join(__dirname, 'public', 'info.html'));
});

app.get('/test', (req, res) => {
  console.log('GET /test');
  console.log('Received Cookies:', req.cookies);
  
  // Set a cookie
  res.cookie('test_seen', 'yes');
  
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
