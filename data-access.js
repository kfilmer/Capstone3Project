const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "custdb";
let collection;

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

async function getCustomers() {
  try {
    const customers = await collection.find().toArray();
    return [customers, null];
  } catch (err) {
    return [null, err.message];
  }
}

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

module.exports = { getCustomers, resetCustomers };
