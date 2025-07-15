const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "custdb";
let collection;

// Connect to MongoDB and set the collection
(async function init() {
  try {
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection("customers");
    console.log("Connected to MongoDB and ready.");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
})();

// Get all customers
async function getCustomers() {
  try {
    const customers = await collection.find().toArray();
    return [customers, null];
  } catch (err) {
    return [null, err.message];
  }
}

// Reset customers collection to default values
async function resetCustomers() {
  try {
    const sampleCustomers = [
      { id: 0, name: "Mary Jackson", email: "maryj@abc.com", password: "maryj" },
      { id: 1, name: "Karen Addams", email: "karena@abc.com", password: "karena" },
      { id: 2, name: "Scott Ramsey", email: "scottr@abc.com", password: "scottr" }
    ];

    await collection.deleteMany({});
    await collection.insertMany(sampleCustomers);

    const count = await collection.countDocuments();
    return [`${count} customer records reset`, null];
  } catch (err) {
    return [null, err.message];
  }
}

// Add a new customer
async function addCustomer(newCustomer) {
  try {
    const result = await collection.insertOne(newCustomer);
    return ["success", result.insertedId, null];
  } catch (err) {
    console.error("Error adding customer:", err);
    return ["fail", null, err.message];
  }
}

// Get a single customer by ID
async function getCustomerById(id) {
  try {
    const customer = await collection.findOne({ id: +id });
    return [customer, null];
  } catch (err) {
    console.error("Error finding customer by ID:", err);
    return [null, err.message];
  }
}

// Update an existing customer
async function updateCustomer(updatedCustomer) {
  try {
    const filter = { id: updatedCustomer.id };
    const update = { $set: updatedCustomer };

    const result = await collection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return [null, "No customer found with that ID"];
    }

    return ["one record updated", null];
  } catch (err) {
    console.error("Error updating customer:", err);
    return [null, err.message];
  }
}

// Export all methods
module.exports = {
  getCustomers,
  resetCustomers,
  addCustomer,
  getCustomerById,
  updateCustomer
};
