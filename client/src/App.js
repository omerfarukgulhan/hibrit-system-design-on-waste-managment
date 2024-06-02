import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import initialData from "./data.json";
import axios from "axios";

mapboxgl.accessToken =
  "pk.eyJ1IjoibGVyaXRoIiwiYSI6ImNsdnIyZmh6cDBnZXYya21oZGFxendvcWsifQ.Qhm_zr1bKU_Jkuk8HSr80w";

export default function App() {
  const [data, setData] = useState(initialData);
  const [index, setIndex] = useState(0);
  const mapContainer = useRef(null);
  const [start, setStart] = useState([data[0].bin_lat, data[0].bin_lng]);
  const [end, setEnd] = useState([data[1].bin_lat, data[1].bin_lng]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/");
        setData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setStart([data[index].bin_lat, data[index].bin_lng]);
    setEnd([data[index + 1].bin_lat, data[index + 1].bin_lng]);
  }, [index, data]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: end,
      zoom: 16,
    });

    map.on("load", () => {
      getRoute(map, start, end);

      map.addLayer({
        id: "start",
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: start,
                },
              },
            ],
          },
        },
        paint: {
          "circle-radius": 10,
          "circle-color": "#3887be",
        },
      });

      map.addLayer({
        id: "end",
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: end,
                },
              },
            ],
          },
        },
        paint: {
          "circle-radius": 10,
          "circle-color": "#f30",
        },
      });
    });

    return () => map.remove();
  }, [start, end]);

  async function getRoute(map, start, end) {
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: "GET" }
      );

      const json = await query.json();
      const data = json.routes[0];
      const route = data.geometry.coordinates;
      console.log(data);
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route,
        },
      };

      if (map.getSource("route")) {
        map.getSource("route").setData(geojson);
      } else {
        map.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: geojson,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });
      }

      const instructions = document.getElementById("instructions");
      const steps = data.legs[0].steps;

      let tripInstructions = "";

      for (const step of steps) {
        tripInstructions += `<li>${step.maneuver.instruction}</li>`;
      }

      instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
        data.duration / 60
      )} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }

  return (
    <div>
      <div
        ref={mapContainer}
        style={{ position: "absolute", top: 0, bottom: 0, width: "100%" }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            margin: "20px",
            width: "25%",
            top: 0,
            bottom: "20%",
            fontFamily: "sans-serif",
          }}
        >
          <button
            onClick={() =>
              index < data.length - 2
                ? setIndex((prev) => (prev = prev + 1))
                : setIndex(0)
            }
            className="next"
            style={{
              backgroundColor: "#4caf50",
              border: "none",
              color: "white",
              padding: "15px 32px",
              marginBottom: "10px",
              textAlign: "center",
              textDecoration: "none",
              display: "block",
              fontSize: "16px",
              marginTop: "10px",
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            Sonraki Rota
          </button>
          <div
            id="instructions"
            style={{
              padding: "20px",
              backgroundColor: "#fff",
              overflowY: "scroll",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
