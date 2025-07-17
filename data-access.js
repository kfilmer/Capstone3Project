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

async function addCustomer(newCustomer) {
  try {
    const result = await collection.insertOne(newCustomer);
    return ["success", result.insertedId, null];
  } catch (err) {
    console.error("Error adding customer:", err);
    return ["fail", null, err.message];
  }
}

async function getCustomerById(id) {
  try {
    const customer = await collection.findOne({ id: +id });
    return [customer, null];
  } catch (err) {
    return [null, err.message];
  }
}

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
    return [null, err.message];
  }
}

async function deleteCustomerById(id) {
  try {
    const result = await collection.deleteOne({ id: +id });

    if (result.deletedCount === 1) {
      return ["one record deleted", null];
    } else {
      return [null, "no record deleted"];
    }
  } catch (err) {
    return [null, err.message];
  }
}

// ✅ New function for search endpoint
async function searchCustomers(field, value) {
  try {
    const allowedFields = ["id", "email", "password"];
    if (!allowedFields.includes(field)) {
      return [null, "name must be one of the following (id, email, password)"];
    }

    const filter = {};
    filter[field] = field === "id" ? +value : value;

    const results = await collection.find(filter).toArray();

    if (results.length === 0) {
      return [null, "no matching customer documents found"];
    }

    return [results, null];
  } catch (err) {
    return [null, err.message];
  }
}

module.exports = {
  getCustomers,
  resetCustomers,
  addCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomerById,
  searchCustomers
};
