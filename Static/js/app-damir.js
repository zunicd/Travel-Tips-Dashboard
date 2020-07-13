//
// Function to plot daily normals for +/- 1 week extended range
//  from last 10 years
//===========================
function weatherHistoryPlot(city, startd, endd) {
  const url = "/api/" + city + "/" + startd + "/" + endd;
  console.log(url);

  // Helper function to select data; returns an array of values
  //  index 0 - date     index 1 - tmin
  //  index 2 - tavg     index 3 - tmax
  function unpack(rows, index) {
    return rows.map(function (row) {
      return row[index];
    });
  }

  d3.json(url).then(function (response) {
    // Grab values from the response json object to build the plots
    let city = response.dataset.city;

    let startDate = response.dataset.start_date;
    let endDate = response.dataset.end_date;
    // Print the names of the columns
    console.log(response.dataset.column_names);
    // Print the data for each day
    console.log(response.dataset.data);
    // var dates = response.dataset.data.map((row) => row[0]);
    var dates = unpack(response.dataset.data, 0);

    let minTemp = unpack(response.dataset.data, 1);
    let avgTemp = unpack(response.dataset.data, 2);
    let maxTemp = unpack(response.dataset.data, 3);

    // console.log(dates, minTemp, avgTemp, maxTemp);

    let tminTrace = {
      type: "scatter",
      mode: "lines+markers",
      name: "Min. Temperature",
      x: dates,
      y: minTemp,
      hovertemplate: "%{y} F<extra>MINT</extra>",
      marker: {
        color: "#1773cf",
        size: 7,
      },
      line: {
        color: "#1773cf",
        width: 3,
      },
    };

    let tavgTrace = {
      type: "scatter",
      mode: "lines+markers",
      name: "Avg. Temperature",
      x: dates,
      y: avgTemp,
      hovertemplate: "%{y} F<extra>AVGT</extra>",
      marker: {
        color: "#009933",
        size: 7,
      },
      line: {
        color: "#009933",
        width: 3,
      },
    };

    let tmaxTrace = {
      type: "scatter",
      name: "Max. Temperature",
      x: dates,
      y: maxTemp,
      hovertemplate: "%{y} F<extra>MAXT</extra>",
      mode: "lines+markers",
      marker: {
        color: "#ff0000",
        size: 7,
      },
      line: {
        color: "#ff0000",
        width: 3,
      },
    };

    let data = [tmaxTrace, tavgTrace, tminTrace];

    let layout = {
      width: 900,
      height: 600,
      title: `Daily Normals (last 10 years) for Trip from <b>${startd}</b> to <b>${endd}</b> <br><b> ${city}</b>`,
      xaxis: {
        autorange: true,
        showgrid: true,
        // range: [dates[0], dates[dates.length - 1]],
        type: "date",
      },
      yaxis: {
        title: "Temperature (F)",
        autorange: true,
        type: "linear",
        showgrid: true,
      },
      shapes: [
        {
          type: "rect",
          xref: "x",
          yref: "paper",
          x0: startd,
          y0: 0,
          x1: endd,
          y1: 1,
          fillcolor: "#d3d3d3",
          opacity: 0.4,
          line: {
            width: 0,
          },
        },
      ],
    };

    Plotly.newPlot("plot", data, layout);
  });
}

// Function to map local attractions
//===========================
function mapAttractions(city) {
  const url = "/api/" + city;
  console.log(url)
  // Grab the data .with d3
  // d3.json(url, function (response) {
  d3.json(url).then(function (response) { 
    console.log(response);
    
    let res = response.data.results;
    console.log(res);
  
    // define coordinates for our cities
    const coordinates = {
      'Chicago': [41.8781, -87.6298],
      'Indianapolis': [39.7684, -86.1581],
      'Las Vegas': [36.1699, -115.1398],
      'Los Angeles': [34.0522, -118.2437],
      'New York City': [40.7128, -74.0059],
      'Washington': [38.9072, -77.0369]
    }
    // Function to get a coordinate for a selected city
    function getCoordinate(city) {
      return coordinates[city];
    }

    // Create a map object
    var myMap = L.DomUtil.get('map');
      if(myMap != null){
        myMap._leaflet_id = null;
      }


    myMap = L.map("map", {
      center: getCoordinate(city),
      zoom: 13
    });

  
    
    // Add a tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    }).addTo(myMap);


    // Loop through all results
    for (i = 0; i < res.length; i++) {
      
      var name = res[i].name;
      
      // Create an array for attraction coordinates
      var lat = res[i].geometry.location.lat;
      var lng = res[i].geometry.location.lng;
      var location = [lat, lng];
  
      var status = res[i].business_status;
      var address = res[i].formatted_address;
  
    
      // Create one marker for each attraction, bind a popup containing useful information
      L.marker(location)
        .bindPopup("<h5>" + name + "</h5> <hr> <h6> " + address + "<br> <b>Status: </b>" + status + "</h6>")
        .addTo(myMap);
    }
  }); 
}


// Function for initial load
//===========================
function init() {
  // Set variables for initial load
  let initCity = "Indianapolis";
  // Today is a start date
  let today = new Date();
  let initStartd = today.toISOString().split("T")[0];

  // End date is in a week
  let endDate = new Date(today.setDate(today.getDate() + 7));
  let initEndd = endDate.toISOString().split("T")[0];
  
  console.log("INIT:", initCity, initStartd, initEndd);


  mapAttractions(initCity);

  weatherHistoryPlot(initCity, initStartd, initEndd);
}

// Function to run after every change
//===========================
function optionChanged() {
  
  let destinationSelect = document.getElementById("destinations");
  let destinations = destinationSelect.options[destinationSelect.selectedIndex].innerText;
  let startd = document.getElementById("startd").value;
  let endd = document.getElementById("endd").value;

  console.log("Changed:", destinations, startd, endd);

  mapAttractions(destinations);
  weatherHistoryPlot(destinations, startd, endd);
}

// Initialize the dashboard
//===========================
init();
