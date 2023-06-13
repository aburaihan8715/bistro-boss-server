const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

// connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.eujox13.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// function for database connection
const run = async () => {
  try {
    const menuCollection = client.db("bistroDB").collection("menu");
    const reviewCollection = client.db("bistroDB").collection("reviews");

    /*====================
    menu apis
    ======================*/
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    /*====================
    reviews apis
    ======================*/
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });
  } finally {
    // await client.close();
  }
};

run().catch((err) => {
  console.log(err.message);
});

// home route
app.get("/", (req, res) => {
  res.json({ message: "Hello from home route!" });
});
// route not found error
app.use((req, res, next) => {
  res.json({ message: "route not found!" });
});

// server error
app.use((err, req, res, next) => {
  res.send(err.message);
});

module.exports = app;

// ==========end============
