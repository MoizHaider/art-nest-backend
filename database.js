const mongodb = require("mongodb");
require("dotenv").config();
const MongoClient = mongodb.MongoClient;

let db;

<<<<<<< HEAD
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
=======
exports.mongoConnect = (cb) => {
  const dbUrl = process.env.MONGODB_URI;
  MongoClient.connect(`${dbUrl}`, {
    ssl: true,
    serverSelectionTimeoutMS: 10000,
  })
    .then((client) => {
      db = client.db("ArtGallery");
      cb()
    })
    .catch((err) => {
      throw "Database not foking found 1";
    });
};

exports.dbConnect = () => {
  if (db) {
    return db;
  }
  throw "Database not foking found 2";
>>>>>>> 05492855fa1ba7f9569192085363aabce4a6f6c3
};
