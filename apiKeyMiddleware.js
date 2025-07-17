// apiKeyMiddleware.js
const { isValidKey } = require('./apiKeyStore');

function apiKeyAuth(req, res, next) {
  const clientKey = req.header("x-api-key");

  if (!clientKey) {
    res.status(401).send("API Key is missing");
    return;
  }

  if (!isValidKey(clientKey)) {
    res.status(403).send("API Key is invalid");
    return;
  }

  next();
}

module.exports = { apiKeyAuth };
