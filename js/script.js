// ==================== define HTML objects ====================
// search form
let inputSearch = document.querySelector("#input-search");
let btnSearch = document.querySelector(".btn-search");

// HTML elements
const currentWeatherDiv = document.querySelector(".current-weather-container");
const forecastDiv = document.querySelector(".forecast-container");
const previousSearchDiv = document.querySelector(".previous-searches-container");

// ==================== global variables ====================
const apiKey = "4c89174a09a24b5bf510c337fd643b7c";
let searchCity;
const searchArray = JSON.parse(localStorage.getItem("searchArray")) || [];

// ==================== functions ====================
// get weather for city depending on whether input is submitted with enter key or click
// if they click the search icon
function getWeatherClick(event) {
  event.preventDefault();
  searchCity = inputSearch.value;

  clearWeather();
  clearForecast();
  getWeather();
  saveSearch();
  displaySearchResults();
};

// if they press enter
function getWeatherEnter(event) {
  if (event.keyCode == 13) {
    event.preventDefault();
    searchCity = inputSearch.value;

    clearWeather();
    clearForecast();
    getWeather();
    saveSearch();
    displaySearchResults();
  }
};

function newSearch(event) {
  clearWeather();
  clearForecast();

  let prevCity = event.target.innerText;
  inputSearch.value = prevCity;
  searchCity = inputSearch.value;
  getWeather();
  
}

// save search array to localStorage
// trim to latest 10 results
function saveSearch() {
  searchArray.push(searchCity);
  if (searchArray.length > 10) {
    searchArray.splice(0, 1);
  };
  localStorage.setItem("searchArray", JSON.stringify(searchArray));
};

// display search array from localStorage on screen in latest order
function displaySearchResults() {
  // remove previous
  while (previousSearchDiv.firstChild) {
    previousSearchDiv.removeChild(previousSearchDiv.firstChild);
  };

  for(let i = searchArray.length-1; i > -1; i--) {
    let searchDiv = document.createElement("div");
    searchDiv.setAttribute("class", "search-items");
    searchDiv.innerHTML = "<p>" + searchArray[i] + "</p>"
    previousSearchDiv.append(searchDiv);
  }
};

// clear current weather
function clearWeather() {
  while (currentWeatherDiv.firstChild) {
    currentWeatherDiv.removeChild(currentWeatherDiv.firstChild);
  };
};

// clear forecast
function clearForecast() {
  while (forecastDiv.firstChild) {
    forecastDiv.removeChild(forecastDiv.firstChild);
  };
}

  // ==================== run OpenWeather API ====================
function getWeather() {  
  fetch(`http://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${apiKey}&units=metric`)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {

    // city name ------------------------------------------------------------- something like if search city == city
    const city = data.name;
    console.log({city});

    // ==================== current weather ====================
    // -------------------- date --------------------
    const unixDate = data.dt;
    function unixToDate(unixDate) {
    let date = moment.unix(unixDate).format("D/M/YY");
    return date;
    };
    const currentDate = unixToDate(unixDate); 

    // add date to HTML
    let dateDiv = document.createElement("div");
    dateDiv.setAttribute("class", "current-data current-date");
    dateDiv.innerHTML = "<p><span class='date'>" + currentDate + "</span></p>";
    currentWeatherDiv.append(dateDiv);

    // -------------------- weather icon --------------------
    const icon = data.weather[0].icon;
    const iconImg = `http://openweathermap.org/img/wn/${icon}@2x.png`;

    // add icon to HTML
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "current-data current-icon");
    let iconImgElmnt = document.createElement("img");
    iconImgElmnt.setAttribute("src", iconImg);
    imgDiv.append(iconImgElmnt);
    currentWeatherDiv.append(imgDiv);

    // -------------------- current temp --------------------
    const temp = data.main.temp;

    // add temp tp HTML
    let tempDiv = document.createElement("div");
    tempDiv.setAttribute("class", "current-data current-temp");
    tempDiv.innerHTML = "<p>Temperature:<br><span class='current-value'>" + temp + "</span> °C</p>";
    currentWeatherDiv.append(tempDiv);

    // -------------------- current humidity --------------------
    const humidity = data.main.humidity;

    // add humidity to HTML
    let humidityDiv = document.createElement("div");
    humidityDiv.setAttribute("class", "current-data current-humidity");
    humidityDiv.innerHTML = "<p>Humidity:<br><span class='current-value'>" + humidity + "</span> %</p>";
    currentWeatherDiv.append(humidityDiv);

    // -------------------- current windspeed --------------------
    const windspd = data.wind.speed;

    // add wind speed to HTML
    let windspdDiv = document.createElement("div");
    windspdDiv.setAttribute("class", "current-data current-windspd");
    windspdDiv.innerHTML = "<p>Wind speed:<br><span class='current-value'>" + windspd + "</span> km/h</p>";
    currentWeatherDiv.append(windspdDiv);

    // -------------------- lat & long coordinates of selected city --------------------
    const lat = data.coord.lat;
    const lon = data.coord.lon;

    // ==================== run OpenWeather API for UV Index ====================
    fetch(`http://api.openweathermap.org/data/2.5/uvi/forecast?appid=${apiKey}&lat=${lat}&lon=${lon}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const uvIndex = data[0].value;

      // add uv index to HTML
      let uvDiv = document.createElement("div");
      uvDiv.setAttribute("class", "current-data current-uv");
      uvDiv.innerHTML = "<p>UV Index:<br><span class='current-value'>" + uvIndex + "</span></p>";
      currentWeatherDiv.append(uvDiv);
    })

  // ==================== run OpenWeather API for 5 day forecast ====================
  fetch(`http://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&lat=${lat}&lon=${lon}&units=metric`)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);

      // get next 5 day arrays (as each day is split into 3 hourly blocks)
      // get forecast array
      let dataArray = data.list;

      // get dates from forecast array
      let dateArray = [];
      for(let i = 0; i < dataArray.length; i++) {
        dateArray.push(parseInt(moment.unix(dataArray[i].dt).format("D")));
      }

      // define today
      let today = parseInt(moment.unix(unixDate).format("D"));

      // put indexes of each day into an array for each day. Put those arrays into an object
      let day1Array = [];
      let day2Array = [];
      let day3Array = [];
      let day4Array = [];
      let day5Array = [];
      for(let i = 0; i < dateArray.length; i++) {
        if(dateArray[i] == today+1) {
          day1Array.push(i);
        } else if(dateArray[i] == today+2) {
          day2Array.push(i);
        } else if(dateArray[i] == today+3) {
          day3Array.push(i);
        } else if(dateArray[i] == today+4) {
          day4Array.push(i);
        } else if(dateArray[i] == today+5) {
          day5Array.push(i);
        }
      };

      let fiveDayObject = 
        {
          "day1": day1Array,
          "day2": day2Array,
          "day3": day3Array,
          "day4": day4Array,
          "day5": day5Array
        };

      // loop through object to display forecast data
      for(let properties in fiveDayObject){
        // -------------------- date --------------------
        let forecastDate = unixToDate(data.list[fiveDayObject[properties][0]].dt);
        console.log({forecastDate});

        // add date to HTML
        let dayDiv = document.createElement("div");
        dayDiv.setAttribute("class", "fcDays");
        let fcDateDiv = document.createElement("div");
        fcDateDiv.setAttribute("class", "f-date");
        fcDateDiv.innerHTML = "<span>" + forecastDate + "</span>";
        dayDiv.append(fcDateDiv);

        // -------------------- max temp --------------------
        console.log(properties);
        console.log(fiveDayObject[properties]);

        // .map creates a new array displaying the temperatures at each time point
        let temps = fiveDayObject[properties].map(function(item) {
          let temp = data.list[item].main.temp;
          return temp
        });

        // reduce compares the temperatures in the array and returns the highest value
        let max = temps.reduce(function(current, item){
          return (current > item)? current: item;
        }, 0);
        console.log(max);

        // add temp to HTML
        let fcTempDiv = document.createElement("div");
        fcTempDiv.setAttribute("class", "f-temp");
        fcTempDiv.innerHTML = "<p>Temp:<br><span class='fc-value'>" + max + "</span> °C</p>";
        dayDiv.append(fcTempDiv);

        // -------------------- icon --------------------
        // get icon at midday each day (or latest if it's not a full day)
        let len = fiveDayObject[properties].length;

        if(len == 8) {
          var middayIndex = fiveDayObject[properties][3];
        } else {
          var middayIndex = fiveDayObject[properties][len-1];
        };

        var forecastIcon = data.list[middayIndex].weather[0].icon;
        console.log({forecastIcon});

        var forecastIconImg = `http://openweathermap.org/img/wn/${forecastIcon}@2x.png`;

        // add date to HTML
        let fcImgDiv = document.createElement("div");
        fcImgDiv.setAttribute("class", "f-icon");
        let fcIconImgElmnt = document.createElement("img");
        fcIconImgElmnt.setAttribute("src", forecastIconImg);
        fcImgDiv.append(fcIconImgElmnt);
        dayDiv.append(fcImgDiv);

        // -------------------- humidity --------------------
        let forecastHumidity = data.list[middayIndex].main.humidity;
        console.log({forecastHumidity});

        // add humidity to HTML
        let fcHumidityDiv = document.createElement("div");
        fcHumidityDiv.setAttribute("class", "f-hum");
        fcHumidityDiv.innerHTML = "<p>Humidity:<br><span class='fc-value'>" + forecastHumidity + "</span> %</p>";
        dayDiv.append(fcHumidityDiv);

        // append dayDiv to forecastDive
        forecastDiv.append(dayDiv);

      };
    })  
  })
};

// ==================== event listeners ====================
btnSearch.addEventListener("click", getWeatherClick);
inputSearch.addEventListener('keypress', getWeatherEnter);
previousSearchDiv.addEventListener("click", newSearch);
