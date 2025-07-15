const express = require('express');         
const path = require('path');               

const app = express();                      
const PORT = 4000;                          

// Middleware to serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server and listen on port 4000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
