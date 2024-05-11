"use strict";
const dotenv = require("dotenv");
const { dbConnect } = require("./database");
const app = require("./functions/api");
const mongoObj = require("./database");
dotenv.config();
const PORT = process.env.PORT;

let server;

mongoObj.mongoConnect(() => {
  server = app.listen(PORT, () => console.log("Local app listening on port 3000!"));
});
app.use(()=>{
  console.log("11")
})

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    //FRONTEND LINK
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
  },
});

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

io.on("connection", (socket) => {
  console.log("Client connected adlfkajsf");

  socket.on("search", async (query) => {
    const searchResults = await performSearch(query);
    console.log("results", searchResults);
    io.emit("searchResults", searchResults);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});