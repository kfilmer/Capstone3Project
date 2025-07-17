const da = require("./data-access");
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const { apiKeyAuth } = require('./apiKeyMiddleware');
const apiKeyStore = require('./apiKeyStore');

const app = express();
const PORT = 4000;

// 🔑 API Key setup
let serverApiKey;
const cliArg = process.argv.find(arg => arg.startsWith("--api-key="));
if (cliArg) {
  serverApiKey = cliArg.split("=")[1];
} else {
  serverApiKey = process.env.API_KEY;
}

if (!serverApiKey) {
  console.error("apiKey has no value. Please provide a value through the API_KEY env var or --api-key cmd line parameter.");
  process.exit(1);
}

apiKeyStore.addStaticKey(serverApiKey, "default");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Protected route
app.get("/customers", apiKeyAuth, async (req, res) => {
  const [cust, err] = await da.getCustomers();
  res.status(cust ? 200 : 500).send(cust ?? err);
});

// ✅ API key registration route
app.get("/apikey", (req, res) => {
  const email = req.query.email;
  if (!email) {
    res.status(400).send("Missing email query parameter");
    return;
  }

  const newKey = apiKeyStore.addApiKey(email);
  res.status(200).send({ apiKey: newKey, email });
});

// ✅ New search route (no API key required)
app.get("/customers/find", async (req, res) => {
  const queryKeys = Object.keys(req.query);

  if (queryKeys.length === 0) {
    res.status(400).send("query string is required");
    return;
  }

  if (queryKeys.length > 1) {
    res.status(400).send("Only one query string field is allowed");
    return;
  }

  const field = queryKeys[0];
  const value = req.query[field];

  const [results, error] = await da.searchCustomers(field, value);

  res.status(results ? 200 : 400).send(results ?? error);
});

// ✅ Other unprotected endpoints
app.get("/reset", async (req, res) => {
  const [result, err] = await da.resetCustomers();
  res.status(result ? 200 : 500).send(result ?? err);
});

app.post("/customers", async (req, res) => {
  const newCustomer = req.body;
  if (!newCustomer || Object.keys(newCustomer).length === 0) {
    res.status(400).send("missing request body");
    return;
  }

  const [status, id, errMessage] = await da.addCustomer(newCustomer);
  if (status === "success") {
    newCustomer._id = id;
    res.status(201).send(newCustomer);
  } else {
    res.status(400).send(errMessage);
  }
});

app.get("/customers/:id", async (req, res) => {
  const id = req.params.id;
  const [customer, errMessage] = await da.getCustomerById(id);
  res.status(customer ? 200 : 404).send(customer ?? errMessage);
});

app.put("/customers/:id", async (req, res) => {
  const updatedCustomer = req.body;
  const id = req.params.id;

  if (!updatedCustomer || Object.keys(updatedCustomer).length === 0) {
    res.status(400).send("missing request body");
    return;
  }

  updatedCustomer.id = +id;
  delete updatedCustomer._id;

  const [message, errMessage] = await da.updateCustomer(updatedCustomer);
  res.status(message ? 200 : 400).send(message ?? errMessage);
});

app.delete("/customers/:id", async (req, res) => {
  const id = req.params.id;
  const [message, errMessage] = await da.deleteCustomerById(id);
  res.status(message ? 200 : 404).send(message ?? errMessage);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
