const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const Bin = require("../models/binModel"); // Ensure this path is correct

const mongoURI =
  "mongodb+srv://omerfarukgulhan:153515@general.bwntdog.mongodb.net/?retryWrites=true&w=majority&appName=general";
const token =
  "pk.eyJ1IjoibGVyaXRoIiwiYSI6ImNsdnIyZmh6cDBnZXYya21oZGFxendvcWsifQ.Qhm_zr1bKU_Jkuk8HSr80w";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error: ", err));

async function fetchBins() {
  try {
    const bins = await Bin.find({ is_full: 1 });
    return bins;
  } catch (error) {
    console.error("Error fetching bins: ", error);
    return [];
  }
}

async function calculateGraph(dataList) {
  const directionsList = [];

  for (let i = 0; i < dataList.length; i++) {
    for (let j = 0; j < dataList.length; j++) {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${dataList[i].bin_lat},${dataList[i].bin_lng};${dataList[j].bin_lat},${dataList[j].bin_lng}?steps=true&geometries=geojson&access_token=${token}`
        );
        if (response.status === 200) {
          directionsList.push(response.data);
        } else {
          console.error(`Error: ${response.status}, ${response.data}`);
          return;
        }
      } catch (error) {
        console.error(
          `Error: ${
            error.response ? error.response.status : "Network error"
          }, ${error.message}`
        );
        return;
      }
    }
  }

  const matrix = Array(dataList.length)
    .fill(null)
    .map(() => Array(dataList.length).fill(0));
  let index = 0;

  for (let i = 0; i < dataList.length; i++) {
    for (let j = 0; j < dataList.length; j++) {
      matrix[i][j] = directionsList[index].routes[0].duration;
      index += 1;
    }
  }

  return matrix;
}

module.exports = calculateGraph;
