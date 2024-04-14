const express = require("express");
var { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("./graphql/schemas");
const graphqlResolver = require("./graphql/resolvers");
const app = express();
const path = require("path");
const userController = require("./controllers/user");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoObj = require("./database");
const ObjectId = require("mongodb").ObjectId;
const auth = require("./middleware/auth");
var cors = require("cors");
const date = require("./Utils/Date");

const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/images");
  },
  filename(req, file, cb) {
    console.log("File fieldname:", file.fieldname);
    console.log("File originalname:", file.originalname);
    cb(null, date.getDate() + "-" + file.originalname);
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
app.post(   // could not use multer here as adding (upload.array("postImages", 10))
  "/add-post",
  (req, res, next) => {
    date.setDate(Date.now());
    next();
  },
  userController.addNewPost
);
app.post("/add-post", upload.single("postImages"));

app.post(
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
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
mongoObj.mongoConnect(() => {
  app.listen(8080);
});
