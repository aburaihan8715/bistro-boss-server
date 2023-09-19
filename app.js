const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var jwt = require("jsonwebtoken");

// middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "unauthorized access" });
  }
  // bearer token
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

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
    const cartCollection = client.db("bistroDB").collection("carts");
    const userCollection = client.db("bistroDB").collection("users");

    /*====================
    jwt api
    ======================*/
    app.post("/jwt", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
      res.send({ token });
    });

    //  ==============user related api==========
    // post or create user data
    app.post("/users", async (req, res) => {
      const userData = req.body;
      const query = { email: userData.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exist!" });
      }
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });

    // get all user data
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // delete user data
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // patch user for making admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //  ==============cart related api==========
    // create cart data
    app.post("/carts", async (req, res) => {
      const cartData = req.body;
      const result = await cartCollection.insertOne(cartData);
      res.send(result);
    });

    // get some data based on login
    app.get("/carts", verifyJWT, async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: "forbidden access" });
      }

      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // delete cart data
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    //  ==============menu related api==========
    // get all menu data
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    //  ==============reviews related api==========
    // get all review data
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
