const express = require("express");
const Bin = require("../models/binModel");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bins = await Bin.find({ is_full: 1 });
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
