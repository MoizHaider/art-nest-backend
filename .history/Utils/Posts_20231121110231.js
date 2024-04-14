const TranidngPosts = ()=>{
    db.collection('myCollection').countDocuments({}, (err, count) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`There are ${count} documents in the collection.`);
        }
      });
}