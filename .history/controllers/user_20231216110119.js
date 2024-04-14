const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const { dbConnect } = require("../database");
const {getDate} =  require("../Utils/Date")

exports.addUserDetails = (req, res, next) => {
  if ((req.isAuth = false)) {
    const error = new Error("Not Authenticated");
    error.code = 400;
    throw error;
  }
  const objId = new ObjectId(req.body._id)
  const db = dbConnect();
  db.collection("usersData")
    .updateOne(
      { _id: objId },
      {
        $set: {
          name: req.body.name,
          title: req.body.title,
          profilePicUrl: req.files.profileImg[0].path,
          backgroundImgUrl: req.files.backgroundImg[0].path,
          about: req.body.about,
        },
      }
    )
    .then(() => res.status(200).send({ message: "success" }));
};

exports.addNewPost = async (req, res, next) => {
  console.log("server Running")
  console.log("files ", req.files)
  console.log("req body ", req.body)
  if (!req.isAuth) {
    throw new Error("not authenticated");
  }
  
  const objId = new ObjectId(req.get("userId"));
  const email = req.get("email");
  const name = req.get("name");
  const profilePicUrl = req.get("profilePicUrl")
  const postName = req.get("imgNames");
  const postUrl = "public\\images\\"+getDate()+"-"+postName;
  const title = req.get("title")
  const description = req.get("description");
  const newPost = {
    urls: postUrl,
    createionDate: new Date().toLocaleDateString(),
    likesCount: 0,
    commentsCount: 0,
    saveCount: 0,
    title: title,
    description: description,
    likes: [],
    score: 500, //Initial Score for the latest posts 
    comments: [],
    user: {
      _id: objId,
      email: email,
      name: name,
      profilePicUrl: profilePicUrl
    },
  };
  console.log("server post", newPost)
  const db = dbConnect();
  let response = {
    postId: null,
    userId: null,
    email: null,
  };
  const postInsrtRes = await db.collection("posts")
    .insertOne(newPost)
  const userPostInsrtRes = await db.collection("usersData").updateOne(
        { _id: objId },
        {
          $push: {
            posts: {
              $each: [postInsrtRes.insertedId.toString()],
              $position: 0,
            },
          },
        }
      );
      res.json(postInsrtRes);
};
