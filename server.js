const da = require("./data-access");              // Import data access layer
const express = require('express');               // Import express
const path = require('path');                     // Import path module
const bodyParser = require('body-parser');        // Import body-parser for JSON parsing

const app = express();                            // Create express app
const PORT = 4000;                                // Define port

// Middleware
app.use(bodyParser.json());                       // Parse incoming JSON in request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from /public

// GET /customers - returns all customers
app.get("/customers", async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust !== null) {
    res.status(200).send(cust);
  } else {
    res.status(500).send(err);
  }
});

// GET /reset - resets the database to 3 default customers
app.get("/reset", async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if (result !== null) {
    res.status(200).send(result);
  } else {
    res.status(500).send(err);
  }
});

// POST /customers - adds a new customer to the database
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
