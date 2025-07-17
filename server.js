const da = require("./data-access");                  // Import data access layer
const express = require('express');                   // Import express
const path = require('path');                         // Import path module
const bodyParser = require('body-parser');            // For JSON parsing
const { createApiKeyAuthMiddleware } = require('./apiKeyMiddleware'); // Middleware

const app = express();
const PORT = 4000;

// 🟦 Step 1: Extract API Key from CLI or env
let serverApiKey;

const cliArg = process.argv.find(arg => arg.startsWith("--api-key="));
if (cliArg) {
  serverApiKey = cliArg.split("=")[1];
} else {
  serverApiKey = process.env.API_KEY;
}

// 🟥 Step 2: Exit if no API key provided
if (!serverApiKey) {
  console.error("apiKey has no value. Please provide a value through the API_KEY env var or --api-key cmd line parameter.");
  process.exit(1);
}

// 🟩 Step 3: Initialize middleware with actual key
const apiKeyAuth = createApiKeyAuthMiddleware(serverApiKey);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Protected route
app.get("/customers", apiKeyAuth, async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust !== null) {
    res.status(200).send(cust);
  } else {
    res.status(500).send(err);
  }
});

// Unprotected routes
app.get("/reset", async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if (result !== null) {
    res.status(200).send(result);
  } else {
    res.status(500).send(err);
  }
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
  if (customer !== null) {
    res.status(200).send(customer);
  } else {
    res.status(404).send(errMessage || "Customer not found");
  }
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
  if (message !== null) {
    res.status(200).send(message);
  } else {
    res.status(400).send(errMessage);
  }
});

app.delete("/customers/:id", async (req, res) => {
  const id = req.params.id;
  const [message, errMessage] = await da.deleteCustomerById(id);
  if (message !== null) {
    res.status(200).send(message);
  } else {
    res.status(404).send(errMessage || "Customer not found");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
