const mongodb = require("mongodb");
require("dotenv").config();
const MongoClient = mongodb.MongoClient;

let db;

exports.mongoConnect = async (cb) => {
  const dbUrl = process.env.MONGODB_URI;
  const client = new MongoClient(dbUrl);
  try {
    console.log("1")
    await client.connect();
    console.log("client connected")
    db = client.db("ArtGallery")
    cb()
  } catch (err) {
    console.log("db not found")
    throw new Error(err)
  }
};

exports.dbConnect = async () => {
  if (db) {
    console.log("Only this one runs");
    return db;
  } else {
    console.log("Only this one runs2");
    await this.mongoConnect(()=>{})
    console.log("2")
    return db;
  }
};
