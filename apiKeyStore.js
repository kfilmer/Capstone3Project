// apiKeyStore.js
const crypto = require('crypto');

const apiKeys = new Map(); // key: string → email: string

// Generate a 16-byte (32-char) random API key
function generateApiKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Add a new key/email pair to the map
function addApiKey(email) {
  const key = generateApiKey();
  apiKeys.set(key, email);
  logKeys();
  return key;
}

// Add a predefined key (e.g. from env/cli) for a default user
function addStaticKey(key, email = "default") {
  apiKeys.set(key, email);
  logKeys();
}

// Validate a key — return true if it exists
function isValidKey(key) {
  return apiKeys.has(key);
}

// For debugging/logging
function logKeys() {
  console.log("Current API Keys:");
  for (const [key, email] of apiKeys.entries()) {
    console.log(`  ${email} → ${key}`);
  }
}

module.exports = {
  addApiKey,
  addStaticKey,
  isValidKey,
  logKeys,
};
