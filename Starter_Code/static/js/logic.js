// API
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// GET request
d3.json(queryUrl).then(function(data){
    createFeatures(data.features);
});

function createFeatures(earthquakeData, platesData){
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    function createCircleMarker(feature, latlng){
        let options = {
            radius: feature.properties.mag*5,
            fillColor: chooseColor(feature.properties.mag),
            color: chooseColor(feature.properties.mag),
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.35
        }
        return Location.circleMarker(latlng, options);
    }

    // Variable for earthquakes to house latlng
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // createMap function
    createMap(earthquakes);
}

// Circles color palette
function chooseColor(mag){
    switch(true){
        case(1.0 <= mag && mag <= 2.5):
            return "#4794AC"; 
        case (2.5 <= mag && mag <=4.0):
            return "#B84199";
        case (4.0 <= mag && mag <=5.5):
            return "#F0DDA9";
        case (5.5 <= mag && mag <= 8.0):
            return "#1774A8";
        case (8.0 <= mag && mag <=20.0):
            return "#9C3B02";
        default:
            return "#107C68";
    }
}

// map legend
let legend = L.control({position: 'bottomright'});
legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [1.0, 2.5, 4.0, 5.5, 8.0];
    var labels = [];
    var legendInfo = "<h4>Magnitude</h4>";

    div.innerHTML = legendInfo

    // go through each magnitude item to label and color legend
    for (var i = 0; i < grades.length; i++) {
        labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
      }

      // adding label list items to the div 
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";

      return div;
    };

// Create map
function createMap(earthquakes) {
    // Define outdoors and graymap layers
    let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
     maxZoom: 20,
     id: "outdoors-v11",
     accessToken: API_KEY
   })
 
   let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
     maxZoom: 20,
     id: "light-v10",
     accessToken: API_KEY
   });

   // baseMaps to hold base layers
   let baseMaps = {
    "Outdoors": streetstylemap,
    "Grayscale": earthquakes
   };

   // overlay to hold overlay layer
   let overlayMaps = {
    Earthquakes: earthquakes
   };

   // streetmap and earthquake layers
   let myMap = L.map("map", {
    center: [
        39.8282, -98.5795
    ],
    zoom: 4,
    layers: [streetstylemap, earthquakes]
   });

   // layer control to map
   L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
   }).addTo(myMap);
   legend.addTo(myMap);
}
