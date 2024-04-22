const { dbConnect } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

const profilePosts = async (page, db, userData, limit) => {
  console.log("THis is userData", userData)
  const postIds = userData.posts.map((post) => new ObjectId(post));
  const userId = userData._id
  const posts = await db
    .collection("posts")
    .find({ _id: { $in: postIds } })
    .skip((page - 1) * limit)
    .limit(5)
    .map(post=>{
      post.liked = false
      for(let i = 0; i<post.likes.lengt; i++){
        if(post.likes[i]._id === userData._id){
          post.liked = true
          break
        }
      }
      return post;
    })
    .toArray();

  return posts;
};

const homePosts = async (userId, page, db, limit) => {
  const ttlPosts = await db
    .collection("posts")
    .countDocuments({}, (err, count) => {
      if (err) {
        console.error(err);
      } else {
        return count;
      }
    });
let posts;
  if(ttlPosts< 3000){
    posts = await db
    .collection("posts")
    .find({})
    .sort({ score: -1 })
    .skip((page-1) * limit)
    .limit(limit)
    .map(post=>{
      post.liked = false
      for(let i = 0; i<post.likes.lengt; i++){
        if(post.likes[i]._id === userId){
          post.liked = true
          break
        }
      }
      return post;
    })
    .toArray((err, result) => {
      if (err) {
        console.error(err);
      } else {
        return result;
      }
    });
  }
  else{
    const ttlParts = Math.floor(ttlPosts / 2000);
    const selectedPart = page % ttlParts === 0 ? ttlParts : page % ttlParts;
    const noOfSkipPosts =
      page % ttlParts === 0 ? page / ttlParts - 1 : page / ttlParts;
  
    posts = await db
      .collection("posts")
      .find({})
      .skip(selectedPart * 2000 - 2000) // minus 2000 to select the lower bound of the range
      .limit(2000)
      .sort({ score: -1 })
      .skip(noOfSkipPosts * limit)
      .limit(limit)    
      .map(post=>{
        post.liked = false
        for(let i = 0; i<post.likes.lengt; i++){
          if(post.likes[i]._id === userId){
            post.liked = true
            break
          }
        }
        return post;
      })
      .toArray((err, result) => {
        if (err) {
          console.error(err);
        } else {
          return result;
        }
      });
  }


  return posts;
};

module.exports = {
  getHomePosts: async (args, req) => {
    const db = dbConnect();
    if ((req.isAuth = false)) {
      const error = new Error("Not Authenticated");
      error.code = 400;
      throw error;
    }
    const userData = await db;
    const posts = await homePosts(args.userId, args.page, db, args.limit);
    return {
      posts,
    };
  },
  getProfilePosts: async (args, req) => {
    const db = dbConnect();
    if ((req.isAuth = false)) {
      const error = new Error("Not Authenticated");
      error.code = 400;
      throw error;
    }
    const userData = await db
      .collection("usersData")
      .find({ _id: new ObjectId(args.userId) })
      .next();
    if (!userData) {
      const error = new Error("User not Found");
      error.code = 401;
      throw error;
    }
    const posts = profilePosts(args.page, db, userData, args.limit);
    console.log("More Posts", posts);
    return { posts };
  },
  homeLoadQuery: async (args, req) => {
    const db = dbConnect();
    if ((req.isAuth = false)) {
      const error = new Error("Not Authenticated");
      error.code(400);
      throw error;
    }
    const posts = await homePosts(args.userId, args.page, db, args.limit);
    

    return {
      posts,
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
    const posts = await profilePosts(args.page, db, userData, args.limit);

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
    const db = dbConnect();
    if(args.liked){
      //deleted like from db
      const response = await db.collection("posts").updateOne({"_id": new ObjectId(args.postId), "likes": args.userId}, {$pull: {"likes":{"userId": `${new ObjectId(args.userId)}`}}, function (err, res){
        if(err){
          console.log(err)
        }
        else{
          return res;
        }
      }})
    }
    
    else{
      //insert like
      const response = await db.collection("posts")
      .updateOne({"_id": new ObjectId(args.postId)},{$push: {'likes': new ObjectId(args.userId)
    }
  }, function(err, res){
    if
  }
)

    }
    console.log(args);
    return "hello";
  },
};
