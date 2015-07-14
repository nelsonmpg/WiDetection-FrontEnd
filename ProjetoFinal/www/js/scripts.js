var arrayHosts = null;
var lastDisp = "";
var lastAntena = "";

// blind, bounce, clip, drop, explode, fold, highlight, puff, pulsate, shake, slide
var efectDiv = "drop";
var timeEfect = 200;

$(document).ready(function () {
    var socket = io.connect(window.location.href);

    $("body").find("#contentor-principal").css({
        height: $("body").height() * 0.876
    });

//    $("body").find(".mdl-grid").css({
//        height: $("body").height() * 0.90
//    });

    showPageToDiv("status.html", "Status");

    $("body").on("click", ".addNewPAge", function () {
        showPageToDiv($(this).data("page"), $(this).data("name"));
    });


    socket.on('newDevice', function (data) {
        if (arrayHosts != null) {
            arrayHosts.updateGraph(data, true);
        }
    });

    $("body").on("click", ".mapOpen > p", function () {
        carregarmapa([["<h4>" + this.parentElement.getAttribute("data-nomeAntena") + "</h4>", this.parentElement.getAttribute("data-lat"), this.parentElement.getAttribute("data-lon")]]);
    });

    $("body").on('click', '#selectDisp > .bootstrap-select > .dropdown-menu li a, #antenasAtivas > .bootstrap-select > .dropdown-menu li a', function () {
        var disp = $("#selectDisp > .bootstrap-select > .dropdown-menu li.selected a").text();
        var antena = $("#antenasAtivas > .bootstrap-select > .dropdown-menu li.selected a").text();
        startAndShowGraph(disp, antena);

    });

});//Fim Document Ready

/**
 * Chama a funcao de acordo com o botao do menu carregado e atualiza o nome do 
 * separador na barra
 * @param {type} page
 * @param {type} name
 * @returns {undefined}
 */
function showPageToDiv(page, name) {
    $(".mdl-layout-title").html(name);
    var page = page; //data-page
    if ($("#contentor-principal").data("page") != page) {
        $("#contentor-principal").data("page", page);
        $("#contentor-principal").effect(efectDiv, timeEfect, function () {
            $.ajax({
                method: 'GET',
                url: "./html/" + page,
                cache: false,
                dataType: "text",
                success: function (data) {
                    $("#contentor-principal").html(data);
                    switch (page) {
                        case "status.html":
                            carregarDivStatus();
                            break;
                        case "Dashboard.html":
                            carregarDivDashboard();
                            break;
                        case "Estatistica.html":
                            carregarDivEstatistica();
                            break;
                        case "Acerca_De.html":
                            carregarDivAbout();
                            break;
                    }
                },
                error: function (err) {
                    alert("error " + err);
                },
                complete: function () {
                    //alert("finished");
                }
            });
        });
    }
}

/**
 * Carrega o layout da div do status
 * @returns {undefined}
 */
function carregarDivStatus() {
    console.log("Carrregar Status!");
    $.ajax({
        type: "GET",
        url: "/getAntActive",
        dataType: 'json',
        success: function (data) {
            for (var ant in data) {
                $("#divAntenas").append("<div class='divAntena mdl-color--white mdl-shadow--2dp'>" +
                        "<img src='./images/antena.png'>" +
                        "<p class='text-center'>" + data[ant].nomeAntena + "</p>" +
                        "<div class='mapOpen' data-nomeAntena='" + data[ant].nomeAntena + "' data-lat='" + data[ant].latitude + "' data-lon='" + data[ant].longitude + "'>" +
                        "<p class='text-center'>lat: " + data[ant].latitude + "</p>" +
                        "<p class='text-center'>lon: " + data[ant].longitude + "</p>" +
                        "</div></div>");
            }
// para aparecer a div com os resultados
            $("#contentor-principal").show(efectDiv, timeEfect);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
}

/**
 * Carrega a div do Dashboard
 * @returns {undefined}
 */
function carregarDivDashboard() {
    console.log("Carrregar Dashboard!");
    lastDisp = "";
    lastAntena = "";
    $("body").find('.selectpicker').selectpicker();
    $.ajax({
        type: "GET",
        url: "/getAntenasAtivas",
        dataType: 'json',
        success: function (data) {
            var listOpt = "";
            for (var i in data) {
                listOpt += "<option data-ant='" + data[i].nomeAntena + "'>" + data[i].nomeAntena + "</option>";
            }
            if (data.length == 0) {
                $('#selectDisp > .bootstrap-select > .dropdown-menu li a').prop('disabled', true);
                $('#selectDisp > .bootstrap-select > .dropdown-menu li a').selectpicker('refresh');
                $('#antenasAtivas > .bootstrap-select > .dropdown-menu li a').prop('disabled', true);
                $('#antenasAtivas > .bootstrap-select > .dropdown-menu li a').selectpicker('refresh');

            } else {
                $("body").find('#antenasAtivas > select').html(listOpt).selectpicker('refresh');
                var disp = $("#selectDisp > .bootstrap-select > .dropdown-menu li.selected a").text();
                var antena = $("#antenasAtivas > .bootstrap-select > .dropdown-menu li.selected a").text();
                startAndShowGraph(disp, antena);
            }

            // para aparecer a div com os resultados
            $("#contentor-principal").show(efectDiv, timeEfect);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
}

/**
 * Carrega a div da estatistica
 * @returns {undefined}
 */
function carregarDivEstatistica() {
    console.log("Carrregar Estatistica!");


// para aparecer a div com os resultados
    $("#contentor-principal").show(efectDiv, timeEfect);
}

/**
 * Carrea a div do Acerca de
 * @returns {undefined}
 */
function carregarDivAbout() {
    console.log("Carrregar About!");


// para aparecer a div com os resultados
    $("#contentor-principal").show(efectDiv, timeEfect);
}

/**
 * Mostra o grafico na sua div de acordo com a selecao dos 
 * dropdrowns selecionados
 * @param {type} disp tipo dos dispositivos
 * @param {type} antena antena selecionada
 * @returns {undefined}
 */
function startAndShowGraph(disp, antena) {
    // se o tipo dos dispositivos anteriormente selecionados seja diferente 
    // do disp atual
    if (lastDisp != disp) {
        // atualiza o valor do estado antigo para o atual
        lastDisp = disp;
        lastAntena = antena;
        // faz o pedido a base de dados de acordo com o tipo dos dispositivos
        $.ajax({
            type: "GET",
            url: "/getAllClientes/" + disp,
            dataType: 'json',
            success: function (data) {
                if (arrayHosts != null) {
                    arrayHosts.stopIntervalGraph();
                }
                arrayHosts = new TransformArray(data, antena);
                arrayHosts.updateGraph("", false);
                arrayHosts.updateIntervalGraph();
                arrayHosts.graph("chartContainer");
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    } else {
        if (lastAntena != antena) {
            lastAntena = antena;
            arrayHosts.stopIntervalGraph();
            var arrayData = arrayHosts.getArray();
            arrayHosts = new TransformArray(arrayData, antena);
            arrayHosts.updateGraph("", false);
            arrayHosts.updateIntervalGraph();
            arrayHosts.graph("chartContainer");
        }
    }
}

//carregar mapa
function carregarmapa(local) {
//    alert();
    // Define your locations: HTML content for the info window, latitude, longitude
    //var locations = [['<h4>Bondi Beach</h4>', -33.890542, 151.274856],['<h4>Coogee Beach</h4>', -33.923036, 151.259052],['<h4>Cronulla Beach</h4>', -34.028249, 151.157507],['<h4>Manly Beach</h4>', -33.80010128657071, 151.28747820854187],['<h4>Maroubra Beach</h4>', -33.950198, 151.259302]];
    var locations = local;
    var markers = new Array();

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
    ];
    var iconsLength = icons.length;
    var map = new google.maps.Map($("body").find("#addmap")[0], {
        zoom: 20,
        center: new google.maps.LatLng(local[0][1], local[0][2]),
        mapTypeId: google.maps.MapTypeId.HYBRID, // ROADMAP, HYBRID, SATELLITE, TERRAIN 
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
            };
        })(marker, i));

        iconCounter++;
        // We only have a limited number of possible icon colors, so we may have to restart the counter
        if (iconCounter >= iconsLength) {
            iconCounter = 0;
        }
    }
    autoCenter(markers, map);
}

function autoCenter(markers, map) {
    //  Create a new viewpoint bound
    var bounds = new google.maps.LatLngBounds();
    //  Go through each...
    for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].position);
    }
    //  Fit these bounds to the map
    map.fitBounds(bounds);
}
