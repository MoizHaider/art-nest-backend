'use strict';
const express = require("express");
var { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("../graphql/schemas");
const graphqlResolver = require("../graphql/resolvers");
const path = require("path");
const userController = require("../controllers/user");
const bodyParser = require("body-parser");
const multer = require("multer");
const {Router} = require("express")

const serverless = require("serverless-http");

const ObjectId = require("mongodb").ObjectId;
const auth = require("../middleware/auth");
var cors = require("cors");
const { setDate, getDate } = require("../Utils/Date");

const { dbConnect } = require("../database");

const Fuse = require("fuse.js");
const dotenv = require("dotenv");
const mongoObj = require("../database");
const socketio = require("socket.io");

const app = express();
const router = Router()
router.use(()=>{
  console.log("2Z")
})
dotenv.config();

const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/images");
  },
  filename(req, file, cb) {
    console.log("File fieldname:", file.fieldname);
    console.log("File originalname:", file.originalname);
    cb(null, getDate() + "-" + file.originalname);
  },
});

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const upload = multer({ storage: fileStorage });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

router.post(
  // could not use multer here as adding (upload.array("postImages", 10)) or any other method wasn't running
  "/add-post", // ruuning the controller function so I did it manually passing the post names in the header from front..
  (req, res, next) => {
    setDate(Date.now());
    next();
  },
  userController.addNewPost
);
router.post("/add-post", upload.array("postImages", 10));

router.post(
  "/create-user-details",
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "backgroundImg", maxCount: 1 },
  ]),
  userController.addUserDetails
);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      console.log("This is", err);
      if (!err.orignialError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "Server Error occured";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);
const fuseOptions = {
  keys: ["name"],
  //threshold: 0.3,
};



router.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});



app.use("/.netlify/functions/", router);

module.exports.handler = serverless(app);



module.exports = app;
