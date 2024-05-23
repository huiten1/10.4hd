function setWeatherData(data) {
  setDayNightCircle(data);
  setClouds(data);

  if (data.current.rain > 0) makeItRain();
  UpdateClock();
  window.setInterval(UpdateClock, 1000);
}
function UpdateClock() {
  var now = new Date(Date.now());
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();
  var seconds_passed_today = seconds + minutes * 60 + hours * 60 * 60;

  var rotation = (720 * seconds_passed_today) / (3600 * 24);
  document.getElementsByClassName(
    "clock-circle"
  )[0].style.rotate = `${-rotation}deg`;
}
function setDayNightCircle(data) {
  const sunrise = new Date(data.daily.sunrise[0]);
  const sunset = new Date(data.daily.sunset[0]);
  const day_seconds = 24 * 60 * 60;
  var day_length = (sunset - sunrise) / 1000;
  var day_portion = (day_length / day_seconds).toFixed(2);
  console.log(data);
  // set day night cycle gradient
  var startPos = ((Date.now() - sunrise) / 1000 / day_seconds) * 360;

  var sun = document.getElementsByClassName("sun")[0];

  var moon = document.getElementsByClassName("moon")[0];
  if (data.current.is_day == 0) {
    moon.style.visibility = "hidden";
    sun.style.visibility = "visible";

    t = Math.abs(Date.now() - sunrise) / 1000 / day_length;
    sun_pos = lerp(lerp(60, 0, t), lerp(0, 60, t), t);
    sun.style.top = `${sun_pos}%`;
  } else {
    sun.style.visibility = "hidden";
    moon.style.visibility = "visible";
    t = Math.abs(Date.now() - sunset) / 1000 / day_length;
    pos = lerp(lerp(0, 1, t), lerp(1, 0, t), t);
    moon.style.top = `${(1 - pos) * 60 + 10}%`;
  }

  colors = {
    sunrise: "#FFAF45",
    dayTransition: "#c6e3e4",
    day: "#5AB2FF",
    sunset: "#FB6D48",
    nightTransition: "#000317",
    night: "#000317",
  };

  // if (data.current.cloud_cover >= 100) {
  //   colors.dayTransition = "#c6c6cc";
  //   colors.day = "#76767a";

  sun.style.visibility = "hidden";
  // }

  document.body.style.background = `conic-gradient(
      from ${-180 - startPos}deg at 50% 100% in xyz,
      ${colors.sunrise} ,
      ${colors.dayTransition} 15deg,
      ${colors.day} ${360 * day_portion}deg,
      ${colors.sunset} ${360 * day_portion + 10}deg,
      ${colors.nightTransition} ${360 * day_portion + 15}deg,
      ${colors.night} ${270}deg,
      ${colors.nightTransition} ${360 - 10}deg,
      ${colors.sunrise} ${360 - 5}deg
    )`;
}

var setClouds = function (data) {
  $(".cloud-row").empty();
  var clouds = "";

  var widthToCover = (window.screen.width * data.current.cloud_cover) / 100;
  var dist = 0;
  console.log(widthToCover);
  while (dist < widthToCover) {
    var width = 200 + Math.floor(Math.random() * 200);
    var height = 100 + Math.floor(Math.random() * 20);

    clouds += `
    <div class="cloud" 
    style="
    left: ${dist + lerp(-20, 20, Math.random())}px;
    top: ${lerp(-20, 20, Math.random())}px;
    width: ${width}px;
    height: ${height}px;">
    <span class="shadow"></span>
    </div>`;
    dist += width * 0.25;
  }
  $(".cloud-row").append(clouds);
};

var makeItRain = function () {
  $(".rain").empty();
  var increment = 0;
  var drops = "";
  var backDrops = "";

  while (increment < 100) {
    var randHundred = Math.floor(Math.random() * 98 + 1);
    var randFive = Math.floor(Math.random() * 4 + 2);
    increment += randFive;
    drops += `
    <div class="drop"
      style="left: ${increment}%; 
      bottom: ${randFive + randFive - 1 + 100}%; 
      animation-delay: 0.${randHundred}s;
      animation-duration: 0.4${randHundred}s;">
        <div class="stem" style="animation-delay: 0.${randHundred}s; 
        animation-duration: 0.5${randHundred}s;">
        </div>
        <div class="splat" style="animation-delay: 0.${randHundred}s; animation-duration: 0.4${randHundred}s;">
        </div>
    </div>`;

    backDrops += `
    <div class="drop"
      style="right: ${increment}%; 
      bottom: ${randFive + randFive - 1 + 100}%; 
      animation-delay: 0.${randHundred}s; 
      animation-duration: 0.5${randHundred}s;">
        <div class="stem"
          style="animation-delay: 0.${randHundred}s;
          animation-duration: 0.5${randHundred}s;">
        </div>
        <div class="splat"
          style="animation-delay: 0.${randHundred}s; 
          animation-duration: 0.5${randHundred}s;">
        </div>
    </div>`;
  }

  $(".rain.front-row").append(drops);
  $(".rain.back-row").append(backDrops);
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      fetch("/weather", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat: latitude, lon: longitude }),
      })
        .then((res) => streamToJSON(res.body))
        .then((data) => setWeatherData(data));
    },
    function (error) {
      // Handle errors, if any
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.error("User denied the request for geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          console.error("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          console.error("The request to get user location timed out.");
          break;
        case error.UNKNOWN_ERROR:
          console.error("An unknown error occurred.");
          break;
      }
    }
  );
} else {
  console.error("Geolocation is not available in this browser.");
}
