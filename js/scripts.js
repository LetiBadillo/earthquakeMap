
//Global variables
var map = "";
var markers = [];
var rectangle = "";
var input = document.getElementById('pac-input');
getLatest();
function clearMap(){
    // Clears old markers and rectangles
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
  
    if(rectangle) rectangle.setMap(null);
    markers = [];

    input.value="";
}
function initAutocomplete() {
    
    //Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 19.4968732, lng: -99.7232673},
      zoom: 7,
      mapTypeId: 'roadmap'
    });

    
    // Add location input to UI element
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(input);
    // Listener to detect when the user selects location
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) return;
        
        //Clear old markers and rectangles
        clearMap();
        
        // Place icon for each location
        var bounds = new google.maps.LatLngBounds();
        
        places.forEach(function(place) {
            
            if (!place.geometry) return;
            
            var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
            };

            // Create a location marker
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));
        
            //Get location bounds
            var ne = place.geometry.viewport.getNorthEast();
            var sw = place.geometry.viewport.getSouthWest();
            
            //Call function to retrieve earthquakes
            getEarthquakes(markers, ne.lat(), sw.lng(), sw.lat(), ne.lng());
        
            //Creates rectangle with location bounds
            rectangle = new google.maps.Rectangle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.1,
                strokeWeight: 1,
                fillColor: '#FF0000',
                fillOpacity: 0.3,
                map: map,
                bounds: {
                north: ne.lat(),
                west: sw.lng(),
                south: sw.lat(),
                east: ne.lng(),
                }
            });
        
            if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
            } else {
            bounds.extend(place.geometry.location);
            }
        });
      map.fitBounds(bounds);
    });
}

function getEarthquakes(markers, north, west, south, east){
    var url = "http://api.geonames.org/earthquakesJSON?north="+north+"&south="+south+"&east="+east+"&west="+west+"&username=holyfletcher&maxRows=10";
    $.get(url, function(data) {
        if(data.earthquakes.length > 0){
            var marker, contentString = "";
            var infowindow = new google.maps.InfoWindow();
            $.each(data.earthquakes, function(key, value){
                marker = ""

                marker = new google.maps.Marker({
                    map: map,
                    position: {lat: value.lat, lng: value.lng},
                }); 
                
                //Earthquake info
                contentString= '<div id="content" class="text-center">'+
                    '<h5 id="firstHeading" class="firstHeading">Earthquake</h5><h'+
                    '<div id="bodyContent">\
                        <p>Location: (' + value.lat+', '+value.lng+')</p>\
                        <p>'+value.datetime+'</p>\
                        <p>Magnitude: ' + value.magnitude+' | Depth: ' + value.depth+'</p>\
                    </div></div>';
                marker.html = contentString;
                 
    
                
                google.maps.event.addListener(marker, 'mouseover', (function(marker) {  
                        return function() {  
                            infowindow.setContent(marker.html);  
                            infowindow.open(map, marker);  
                        }  
                })(marker)); 

                markers.push(marker);
            });
        }else{
            showModal("No matches","0 results were found");
        }
    }).fail(function(err) {
        showModal("Error","Ups, error encountered.");
    });
}

function getLatest(){
    var url = "http://api.geonames.org/earthquakesJSON?north=90&south=-90&east=180&west=-180&username=holyfletcher&date="+getToday();
    console.log(url);
    console.log(getToday());
    $.get(url, function(data) {
        console.log(data);
        if(data.earthquakes.length > 0){
            var content = "";
            $.each(data.earthquakes, function(key, value){
                content += '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">\
                <small><b>#'+(key+1)+'</b> <span class="badge badge-secondary">'+value.datetime+'</span></small>\
                <br>\
                <small>Coordinates: (' + value.lat+', '+value.lng+')</small>\
                <br>\
                <small>Magnitude: ' + value.magnitude+' Depth: ' + value.depth+'</small>\
                </a>';
            });
            $('#latest_earthquakes').html(content);
        }else{
            content = ""
        }
        $('#latest_earthquakes').html(content);
    }).fail(function(err) {
        showModal("Error","Ups, error encountered.");
    });
}

function showModal(title, body){
    $('.modal-title').html(title);
    $('.modal-body').html('<p>'+body+'</p>');
    $('#alertModal').modal('show'); 
    clearMap();
}

function getToday() {
    var date = new Date();
    var dd = date.getDate(); //yields day
    var mm = date.getMonth(); //yields month
    var yyyy = date.getFullYear()-1; //yields year
    var today= yyyy + "-" +( mm+1) + "-" + dd;
 
    return today;
 }
