const express = require("express");
const Bin = require("../models/binModel");
const dijkstra = require("../util/dijkstra");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pathData = await dijkstra();
    const bins = await Bin.find({ is_full: 1 });
    console.log("path");
    console.log(pathData);
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
