const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  bin_lng: Number,
  bin_lat: Number,
  bin_location_str: String,
  bin_area_code: Number,
  bin_type_id: Number,
  is_full: Number,
});

const Bin = mongoose.model("bins", binSchema);

module.exports = Bin;
