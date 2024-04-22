const express = require("express");
var { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("./graphql/schemas");
const graphqlResolver = require("./graphql/resolvers");
const path = require("path");
const userController = require("./controllers/user");
const bodyParser = require("body-parser");
const multer = require("multer");

const ObjectId = require("mongodb").ObjectId;
const auth = require("./middleware/auth");
var cors = require("cors");
const { setDate, getDate } = require("./Utils/Date");

const { dbConnect}  = require("./database");

const Fuse = require("fuse.js");
const dotenv = require("dotenv");
const mongoObj = require("./database");
const socketio = require("socket.io");


const app = express();

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

app.post(
  // could not use multer here as adding (upload.array("postImages", 10)) or any other method wasn't running
  "/add-post", // ruuning the controller function so I did it manually passing the post names in the header from front..
  (req, res, next) => {
    setDate(Date.now());
    next();
  },
  userController.addNewPost
);
app.post("/add-post", upload.array("postImages", 10));

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
const fuseOptions = {
  keys: ["name"],
  //threshold: 0.3,
};

const performSearch = async (query) => {
  console.log("search query ", query);
  let db = await dbConnect();
  const documents = await db
    .collection("usersData")
    .find({})
    // .find({ "name" : { $regrex: /query/ } })
    .project({ name: 1, profilePicUrl: 1, title: 1 })
    .toArray();

  const fuse = new Fuse(documents, fuseOptions);

  return fuse.search(query);
};

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
let server
const PORT = process.env.PORT || 8080;

mongoObj.mongoConnect(()=>{
  server = app.listen(PORT, () => {
    console.log("listening on port 8080");
  });
});


const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    //FRONTEND LINK
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("search", async (query) => {
    const searchResults = await performSearch(query);
    console.log("results", searchResults);
    io.emit("searchResults", searchResults);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});



module.exports = app;
