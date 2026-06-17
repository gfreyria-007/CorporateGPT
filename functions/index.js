const functions = require('firebase-functions');

// Placeholder for /api/models
exports.models = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.json({ status: 'models endpoint reachable', data: null });
});

// Placeholder for /api/gemini
exports.gemini = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.json({ status: 'gemini endpoint reachable', data: null });
});
