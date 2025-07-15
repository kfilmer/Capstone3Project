const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";           // Default local MongoDB connection
const client = new MongoClient(url);

const dbName = "custdb";                           // Database name
let collection;

// Immediately-invoked function to connect on load
(async function init() {
  try {
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection("customers");       // Collection name
    console.log("Connected to MongoDB and ready.");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
})();

// getCustomers method to return all customer documents
async function getCustomers() {
  try {
    const customers = await collection.find().toArray();
    return [customers, null]; // success: return data and no error
  } catch (err) {
    console.error("Error fetching customers:", err);
    return [null, err.message]; // failure: return null and error message
  }
}

module.exports = { getCustomers };
