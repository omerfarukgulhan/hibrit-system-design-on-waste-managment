// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/binRoute");

const app = express();
const port = 5000;

app.use(cors());

const mongoURI =
  "mongodb+srv://<username>:<password>@general.bwntdog.mongodb.net/?retryWrites=true&w=majority&appName=general";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected"))
  .catch((err) => console.error("Err: ", err));

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
