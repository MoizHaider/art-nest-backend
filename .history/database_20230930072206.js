const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let db;

exports.mongoConnect = (cb) => {
  MongoClient.connect(
    "mongodb+srv://MoizHiader:moiz15121472@cluster0.w6loomf.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      serverSelectionTimeoutMS: 5000,
    }).then(client=>{
        db = client.db("A")
        cb()
    }).catch(err=>{
        console.log(err)
    });
};

exports.connectDatabase = ()=>{
    if(db){
        return db;
    }
    throw "Database not found";
}

