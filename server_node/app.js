const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());

const mongoURI =
  "mongodb+srv://omerfarukgulhan:153515@general.bwntdog.mongodb.net/?retryWrites=true&w=majority&appName=general";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected"))
  .catch((err) => console.error("Err: ", err));

const Bin = mongoose.model("bins", {
  bin_lng: Number,
  bin_lat: Number,
  bin_location_str: String,
  bin_area_code: Number,
  bin_type_id: Number,
  is_full: Number,
});

app.get("/", async (req, res) => {
  try {
    const bins = await Bin.find({ is_full: 1 });
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
