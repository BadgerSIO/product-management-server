const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
var jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const port = process.env.Port || 5000;
require("dotenv").config();

//midleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("product server is running");
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "saad err 1 Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res
        .status(401)
        .send({ message: "saad err 2  Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

//database connect
const uri = `mongodb+srv://${process.env.PM_DBUSERNAME}:${process.env.PM_BDPASS}@cluster0.gqpfnmn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    const categoriesCollection = client
      .db("productManagement")
      .collection("categories");
    const productCollection = client
      .db("productManagement")
      .collection("products");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1hr",
      });
      res.send({ token });
    });

    app.get("/categories", verifyJwt, async (req, res) => {
      let query = {};
      if (req.decoded.email !== req.query.email) {
        res.status(403).send({ message: "saad err 3 access forbidden" });
      }
      if (req.query.email) {
        query = {
          user: req.query.email,
        };
      }
      const cursor = categoriesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addCategory", async (req, res) => {
      const newcategory = req.body;
      const result = await categoriesCollection.insertOne(newcategory);
      res.send(result);
    });
    app.post("/addProduct", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    app.delete("/deleteCat/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await categoriesCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};
run().catch((error) => console.log(error));
