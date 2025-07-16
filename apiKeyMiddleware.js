// apiKeyMiddleware.js

function apiKeyAuth(req, res, next) {
  const clientKey = req.header("x-api-key");
  const serverKey = process.env.API_KEY;

  if (!clientKey) {
    res.status(401).send("API Key is missing");
    return;
  }

  if (clientKey !== serverKey) {
    res.status(403).send("API Key is invalid");
    return;
  }

  next(); // API key is valid, continue to next middleware
}

module.exports = { apiKeyAuth };
