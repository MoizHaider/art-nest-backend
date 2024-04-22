const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let db;

exports.mongoConnect = (cb) => {
  MongoClient.connect(
    `${}`,
    {
      ssl: true,
      serverSelectionTimeoutMS: 5000,
    }).then(client=>{
        db = client.db("ArtGallery")
        cb()
    }).catch(err=>{
        console.log(err)
    });
};

exports.dbConnect = ()=>{
    if(db){
        return db;
    }
    throw "Database not found";
}

