const { dbConnect } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

// Input Validation

const calcScore = async (db, postId, type, increment) => {
  const LIKE_WEIGHT = 1;
  const COMMENT_WEIGHT = 1.5;
  const DECAY_FACTOR = 1.5;
  const now = new Date();

  let post = await db
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) });
  const postCreationDate = new Date(post.createionDate);
  const timeDiff = Math.abs(now - postCreationDate);
  const timeDiffInHours = timeDiff / 1000 / 60 / 60;
  if (type == "like") {
    post.likesCount = increment ? post.likesCount + 1 : post.likesCount - 1;
  } else {
    post.commentsCount = increment
      ? post.commentsCount + 1
      : post.commentsCount - 1;
  }
  const score =
    (LIKE_WEIGHT * post.likesCount + COMMENT_WEIGHT * post.commentsCount) /
    Math.pow(timeDiffInHours + 2, DECAY_FACTOR);
  return score;
};
const profilePosts = async (page, db, userData, limit) => {
  const postIds = userData.posts.map((post) => new ObjectId(post));
  const userId = userData._id;

  const posts = await db
    .collection("posts")
    .find({ _id: { $in: postIds } })
    .skip((page - 1) * limit)
    .limit(5)
    .map((post) => {
      post.liked = false;
      for (let i = 0; i < post.likes.length; i++) {
        if (post.likes[i].toString() === userId.toString()) {
          post.liked = true;
          break;
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
  if (ttlPosts < 3000) {
    posts = await db
      .collection("posts")
      .find({})
      .sort({ score: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .map((post) => {
        post.liked = false;
        for (let i = 0; i < post.likes.length; i++) {
          if (post.likes[i].toString() === userId) {
            post.liked = true;
            break;
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
  } else {
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
      .map((post) => {
        post.liked = false;
        for (let i = 0; i < post.likes.lengt; i++) {
          if (post.likes[i]._id === userId) {
            post.liked = true;
            break;
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
    console.log("my user", userData);
    return {
      userData,
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
  async likePost(args, req) {
    if (!req.isAuth) {
      const error = new Error("not Authenticated");
      error.code = 400;
      throw error;
    }
    const db = dbConnect();

    if (args.liked) {
      //deleted like from db
      const score = await calcScore(db, args.postId, "like", false);
      const response = await db.collection("posts").updateOne(
        { _id: new ObjectId(args.postId) },
        {
          $pull: { likes: new ObjectId(args.userId) },
          $set: { score: score },
        },
        function (err, res) {
          if (err) {
            console.log(err);
          } else {
            return res;
          }
        }
      );
    } else {
      //insert like
      const score = await calcScore(db, args.postId, "like", true);
      const response = await db.collection("posts").updateOne(
        { _id: new ObjectId(args.postId) },
        {
          $push: { likes: new ObjectId(args.userId) },
          $set: { score: score },
        },
        function (err, res) {
          if (err) {
            console.log(err);
          } else {
            return res;
          }
        }
      );
    }
    return "Done";
  },
  async addComment(args, req) {
    if ((req.isAuth = false)) {
      const error = new Error("Not Authenticated");
      error.code = 400;
      throw error;
    }
    const db = dbConnect();
    const insertData = {
      text: args.text,
      _id: new ObjectId(args.userId),
    };
    console.log("args ", args);
    const score = await calcScore(db, args.postId, "comment", true);
    const response = await db
      .collection("posts")
      .updateOne(
        { _id: new ObjectId(args.postId) },
        { $push: { comments: insertData }, $set: { score: score } },
        function (err, res) {
          if (err) {
            console.log(err);
          } else {
            return res;
          }
        }
      );
    if (response.acknowledged) {
      return "Done";
    } else {
      const err = new Error("Comment not added");
      err.code = 400;
      throw err;
    }
  },
  async getComments(args, req) {
    if ((req.isAuth = false)) {
      const error = new Error("Not Authenticated");
      error.code = 400;
      throw error;
    }
    console.log("args ", args)
    const db = dbConnect();
    

    // const response = await db.collection("posts")
    //   .aggregate([
    //     { $match: { _id: new ObjectId(args.postId) } },
    //     {
    //       $project: {
    //         "comments": 1,
    //       },
    //     },
    //     {$skip: (page-1)*5},
    //     {$limit: 5}
    //   ])
    //   .toArray((err, res) => {
    //     if (err) throw err;
    //     return res;
    //   });
    const response = await db.collection("posts")
      .aggregate([
        { $match: { _id: new ObjectId(args.postId) } },
        {$unwind: "$comments"},
        {limit: 5},
        {skip: (1-1)*5},
        {$project: {
          "_id":0,
          "comments": 1
        }},
        {$lookup: {
          from : "usersData",
          localField: "comments._id",
          foreignField: "_id",
          as: "userData"
        }}
      ])
      .toArray((err, res) => {
        if (err) throw err;
        return res;
      });

    

  
  

      console.log("Comments REs", response)
  },
};
