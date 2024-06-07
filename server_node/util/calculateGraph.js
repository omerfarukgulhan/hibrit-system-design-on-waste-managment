const axios = require("axios");
const Bin = require("../models/binModel");

const token = "api key";

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
