const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.Port || 5000;
require("dotenv").config();
console.log(process.env.PM_DBUSERNAME);

//midleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("product server is running");
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});

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

    app.get("/categories", async (req, res) => {
      const query = {};
      const cursor = categoriesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addCategory", async (req, res) => {
      const newcategory = req.body;
      console.log(newcategory);
      const result = await categoriesCollection.insertOne(newcategory);
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
