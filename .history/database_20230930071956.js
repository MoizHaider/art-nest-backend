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
    }).then(client=>{
        db = client.db()
        cb()
    }).catch(err=>{
        console.log(err)
    });
};

const connectDatabase = ()=>{
    if(db){
        return db;
    }
    throw "Database not found"
}