const express = require("express");
const morgan = require("morgan");
var bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;
position = {};

var url = "";

const fetchWeatherData = (lat, lon) => {
  return fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset&timezone=Australia%2FSydney&forecast_days=1`
  );
};

app.get("/", (req, res, next) => {
  res.render("index", { title: "Weather Effect" });
});

app.post("/weather", (req, res, next) => {
  fetchWeatherData(req.body.lat, req.body.lat)
    .then((response) => response.json())
    .then((json) => res.send(json))
    .catch((error) => res.status(500));
  //   res.send();
});
app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log(`Type Ctrl+C to shut down the web server`);
});
