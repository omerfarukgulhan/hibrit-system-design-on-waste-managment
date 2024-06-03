const express = require("express");
const Bin = require("../models/binModel");
const router = express.Router();
const dijkstra = require("../util/dijkstra");
const pathLenghts = require("../util/pathLenghts");

router.get("/", async (req, res) => {
  try {
    const bins = await Bin.find();
    const fullBins = bins.filter((bin) => bin.is_full === 1);

    let fullBinIds = fullBins.map((bin) => bin.id - 1);

    const order = await dijkstra(pathLenghts, fullBinIds);

    const sortedBins = order.map((id) => bins.find((bin) => bin.id - 1 === id)); // Adjust if needed

    res.json(sortedBins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
