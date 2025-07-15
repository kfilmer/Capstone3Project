const da = require("./data-access");
const express = require('express');         
const path = require('path');               

const app = express();                      
const PORT = 4000;                          

// Middleware to serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/customers", async (req, res) => {
  const [cust, err] = await da.getCustomers();

  if (cust !== null) {
    res.status(200).send(cust);
  } else {
    res.status(500).send(err);
  }
});

// Start the server and listen on port 4000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
