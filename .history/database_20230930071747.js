const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let db;

const mongoConnect = (cb) => {
  MongoClient.connect(
    "mongodb+srv://MoizHiader:moiz15121472@cluster0.w6loomf.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      serverSelectionTimeoutMS: 5000,
    }
  );
};
