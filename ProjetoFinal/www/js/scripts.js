
var updateInterval = 1000;
//var dataLength = 350; // number of dataPoints visible at any point
var disps = []; // dataPoints

var arrayHosts = null;
var dps = [];
var dataLength = 100;
$(document).ready(function () {
    var socket = io.connect(window.location.href);
    $("body").find("#contentor-principal").css({
        height: $("body").height() * 0.876
    });
    $("body").find(".mdl-grid").css({
        height: $("body").height() * 0.90
    });
    $("#updatePrefix").click(function () {
        $.ajax({
            type: "GET",
            url: "/updatePrefix",
            dataType: 'json',
            success: function (data) {
                $("#result").append(JSON.stringify(data) + "<br>");
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    });
    $("#getClientes").click(function () {
        $.ajax({
            type: "GET",
            url: "/getClientes/Clientes/cliente/48:5D:60:3C:32:44",
            dataType: 'json',
            success: function (data) {
                $("#result").html(JSON.stringify(data));
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    });
    $.ajax({
        type: "GET",
        url: "/getAllClientes",
        dataType: 'json',
        success: function (data) {
            arrayHosts = new TransformArray(data, "antena-Nel");
            arrayHosts.updateGraph("", false);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
    socket.on('newDevice', function (data) {
        if (arrayHosts != null) {
            arrayHosts.updateGraph(data, true);
        }
    });
    $("body").on("click", "#showgraph", function () {
        if (arrayHosts != null) {
            arrayHosts.graph("chartContainer");
            console.log("graph");
        }
    });
    setInterval(function () {
        if (arrayHosts != null) {
            arrayHosts.updateGraphToInterval("", false);
//            console.log("+++++++++++++++++++++++++++++++");
        }
    }, updateInterval);
//    $("body").ready('polymer-ready', function (e) {
//        var ajax = document.querySelector('core-ajax');
//
//        // Respond to events it fires.
//        ajax.addEventListener('core-response', function (e) {
//            console.log(this.response);
//            arrayHosts = new TransformArray(this.response, "antena-Nel");
//            arrayHosts.updateGraph("", false);
//            arrayHosts.graph("chartContainer");
//        });
//
//        ajax.go(); // Call its API methods.
//    });
//
//    $("body").on('click', 'button', function () {
//        alert("sadf");
//    });

    /**
     * click no item estatistica do menu
     */
    $("body").on("click", "nav > a:nth-child(3)", function () {
        $("#contentor-principal").html("<div class='container'><div class='row col-md-12'></div></div>");
        $.ajax({
            type: "GET",
            url: "/getAntActive",
            dataType: 'json',
            success: function (data) {
                for (ant in data) {
                    $("#contentor-principal > div > div").append("<div class='divAntena'><img src='images/antena.png' style='width:100%;height:100%'><p class='text-right'>" + data[ant].nomeAntena + "</p>" +
                            "<div class='mapOpen' data-nomeAntena=" + data[ant].nomeAntena + " data-lat=" + data[ant].latitude + " data-lon=" + data[ant].longitude + "><p class='text-right'>lat:" + data[ant].latitude + "</p>" +
                            "<p class='text-right'>lon:" + data[ant].longitude + "</p></div></div>");
                }
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    });
    
    $("body").on("click", ".mapOpen > p", function () {
        alert();
        $("#contentor-principal").append("<div id='map' class='row'></div>");
        carregarmapa([["<h4>"+this.parentElement.getAttribute("data-nomeAntena")+"</h4>",this.parentElement.getAttribute("data-lat"),this.parentElement.getAttribute("data-lon")]]);
    });
    //Fim Document Ready
});


//carregar mapa
var carregarmapa = function (local) {
    alert();
    // Define your locations: HTML content for the info window, latitude, longitude
    //var locations = [['<h4>Bondi Beach</h4>', -33.890542, 151.274856],['<h4>Coogee Beach</h4>', -33.923036, 151.259052],['<h4>Cronulla Beach</h4>', -34.028249, 151.157507],['<h4>Manly Beach</h4>', -33.80010128657071, 151.28747820854187],['<h4>Maroubra Beach</h4>', -33.950198, 151.259302]];
    var locations = local;

    // Setup the different icons and shadows
    var iconURLPrefix = 'http://maps.google.com/mapfiles/ms/icons/';

    var icons = [
        iconURLPrefix + 'red-dot.png',
        iconURLPrefix + 'green-dot.png',
        iconURLPrefix + 'blue-dot.png',
        iconURLPrefix + 'orange-dot.png',
        iconURLPrefix + 'purple-dot.png',
        iconURLPrefix + 'pink-dot.png',
        iconURLPrefix + 'yellow-dot.png'
    ]
    var iconsLength = icons.length;

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: new google.maps.LatLng(local[0][1], local[0][2]),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        panControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    });

    var infowindow = new google.maps.InfoWindow({
        maxWidth: 160
    });

    var markers = new Array();

    var iconCounter = 0;

    // Add the markers and infowindows to the map
    for (var i = 0; i < locations.length; i++) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map,
            icon: icons[iconCounter]
        });

        markers.push(marker);

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infowindow.setContent(locations[i][0]);
                infowindow.open(map, marker);
            }
        })(marker, i));

        iconCounter++;
        // We only have a limited number of possible icon colors, so we may have to restart the counter
        if (iconCounter >= iconsLength) {
            iconCounter = 0;
        }
    }

    function autoCenter() {
        //  Create a new viewpoint bound
        var bounds = new google.maps.LatLngBounds();
        //  Go through each...
        for (var i = 0; i < markers.length; i++) {
            bounds.extend(markers[i].position);
        }
        //  Fit these bounds to the map
        map.fitBounds(bounds);
    }
    autoCenter();

}



