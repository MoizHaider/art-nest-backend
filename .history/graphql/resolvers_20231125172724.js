const { dbConnect } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

const profilePosts = async (page, db, userData)=>{
  const postIds = userData.posts.map((post) => new ObjectId(post));
  const posts = await db
    .collection("posts")
    .find({ _id: { $in: postIds } })
    .limit(5)
    .toArray();
}
module.exports = {
  homeLoadQuery: async (args, req) => {
    const noOfPosts = req.get("noOfPosts")
    console.log("No of", noOfPosts)
    const db = dbConnect();
    if ((req.isAuth = false)) {
      const error = new Error("Not Authenticated");
      error.code(400);
      throw error;
    }
    
    const ttlPosts = await db
      .collection("posts")
      .countDocuments({}, (err, count) => {
        if (err) {
          console.error(err);
        } else {
          return count;
        }
      });

    const ttlParts = Math.floor(ttlPosts / 2000);
    const randomPart = Math.floor(Math.random() * (ttlParts - 0)) + 0;
    const rangeLowerBound = randomPart != 0 ? randomPart * 2000 - 2000 : 0;
    
    const sortedPosts = await db
      .collection("posts")
      .find({})
      .skip(rangeLowerBound)
      .limit(2000)
      .sort({ score: -1 })
      .limit(20)
      .toArray((err, result) => {
        if (err) {
          console.error(err);
        } else {
          return result;
        }
      });
    return {
      posts: sortedPosts,
      events: [
        {
          _id: "22",
          imgUrl: "234",
        },
      ],
    };
  },

  async profileLoadQuery(args, req) {
    if ((req.isAuth = false)) {
      const error = new Error("Not Authenticated");
      error.code = 400;
      throw error;
    }
    const db = dbConnect();
    const userData = await db
      .collection("usersData")
      .find({ _id: new ObjectId(args.userId) })
      .next();
    if (!userData) {
      const error = new Error("User not Found");
      error.code = 401;
      throw error;
    }
   profilePosts(1, )
    console.log("posts ", posts);
    return { userData: userData, posts: posts };
  },
  async login({ email, password }, req) {
    const db = dbConnect();
    const userData = await db
      .collection("usersData")
      .find({ email: email })
      .next();
    if (!userData) {
      const error = new Error("User not Found");
      error.code = 401;
      throw error;
    }
    const result = await bcrypt.compare(password, userData.password.toString());
    if (!result) {
      const error = new Error("Password is incorrect");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: userData._id.toString(),
        email: userData.email,
      },
      "somesecretstring"
    ); //also can add an object after the key like { expiresIn: '1h' }
    return {
      _id: userData._id,
      token: token,
    };
  },
  async signup({ email, password, confirmPassword }, req) {
    const hashPass = await bcrypt.hash(password, 12);
    try {
      const db = dbConnect();
      await db
        .collection("usersData")
        .findOne({ email: email })
        .then((result) => {
          if (result) {
            throw new Error("user already exists");
          }
        });
      //Check wether the email already exists first
      const data = await db.collection("usersData").insertOne({
        name: "",
        title: "",
        email: email,
        password: hashPass,
        posts: [],
        savedPosts: [],
        profilePicUrl: "",
        backgroundImgUrl: "",
        about: "",
        badges: [],
        events: [],
        followers: [],
        following: [],
      });

      return {
        _id: data.insertedId.toString(),
        email: email,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  isLoggedIn(args, req) {
    if (!req.isAuth) {
      const error = new Error("not Authenticated");
      error.code = 400;
      throw error;
    }
    return {
      token: args.token,
      _id: args._id,
    };
  },
  likePost(args, req) {
    if (!req.isAuth) {
      const error = new Error("not Authenticated");
      error.code = 400;
      throw error;
    }
    console.log(args);
    return "hello";
  },
};
