"use strict";
const dotenv = require("dotenv");
const { dbConnect } = require("./database");
const app = require("./functions/api");
const mongoObj = require("./database");

const PORT = process.env.PORT;

mongoObj.mongoConnect(() => {
  app.listen(PORT, () => console.log("Local app listening on port 3000!"));
});
