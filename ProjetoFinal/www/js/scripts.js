var arrayHosts = null;
var arrayGraph = null;
var graphOneCol = null;
var antenas = null;
var lastDisp = "";
var lastAntena = "";
var geocoder;
var address;
var temp;

// blind, bounce, clip, drop, explode, fold, highlight, puff, pulsate, shake, slide
var efectDiv = "drop";
var timeEfect = 200;

$(document).ready(function () {
    var socket = io.connect(window.location.href);

    // socket detera quando a ligacao com o servidor e cortada
    socket.on('disconnect', function () {
        console.log('Socket disconnected');
        if (arrayHosts != null) {
            arrayHosts.stopIntervalGraph();
        }
    });

    $("body").find("#contentor-principal").css({
        height: $("body").height() * 0.876
    });

    showPageToDiv("status.html", "Status");

    $("body").on("click", ".addNewPAge", function () {
        showPageToDiv($(this).data("page"), $(this).data("name"));
    });

    socket.on('updateArrayDisp', function (disp, data) {
        if (arrayHosts != null) {
            arrayHosts.updateArrayTransform(disp, data);
        }
    });

    $("body").on("click", ".mapOpen", function () {
        criarLightBox("map");
        $("#popup").append(this.getAttribute("data-nomeAntena"));
        carregarmapa([["<h4>" + this.getAttribute("data-nomeAntena") + "</h4>", this.getAttribute("data-lat"), this.getAttribute("data-lon")]]);
    });

    $("body").on('click', '#selectDisp > .bootstrap-select > .dropdown-menu li a, #antenasAtivas > .bootstrap-select > .dropdown-menu li a', function () {
        var disp = $("#selectDisp > .bootstrap-select > .dropdown-menu li.selected a").text();
        var antena = $("#antenasAtivas > .bootstrap-select > .dropdown-menu li.selected a").text();
        startAndShowGraph(disp, antena);
    });

    $("body").on("click", "#close", function () {
        $("#hover, #popup").fadeOut(300, function () {
            $(this).remove();
        });
    });

//    $("body").on("click", "#verTodasAntenas", function () {
//        //getTodasAntenas
//       
//
//    });

    //Alteracao
    $("body").on("click", ".divAntena", function () {
        var nomeAntena = this.getAttribute("data-nomeAntena");
        var local = this.getAttribute("data-local");
        var numAP;
        var numDISP;
        switch (this.getAttribute("data-tipo")) {
            case "now":
                $.ajax({
                    type: "GET",
                    url: "/getAtives/AP/" + nomeAntena,
                    dataType: 'json',
                    success: function (data) {
                        numAP = data[0].length;
                        $.ajax({
                            type: "GET",
                            url: "/getAtives/DISP/" + nomeAntena,
                            dataType: 'json',
                            success: function (data) {
                                $("body").find(".btnBack").css({
                                    visibility: "visible"
                                });
                                numDIS = data[0].length;
                                var valor = [];
                                valor[0] = numAP;
                                valor[1] = numDIS;
                                console.log(valor);
                                graphOneCol = new ArrayToGraph(valor, "Quantidade de dispositipos ativos na Antena:", nomeAntena, local, "column");
                                graphOneCol.clickToBarGraph(2);
                                graphOneCol.createArrayToStatusBarGraph();
                            },
                            error: function (error) {
                                console.log(JSON.stringify(error));
                            }
                        });
                    },
                    error: function (error) {
                        console.log(JSON.stringify(error));
                    }
                });
                break;
            case "all":
                $.ajax({
                    type: "GET",
                    url: "/GetDeviceByAntena/" + nomeAntena,
                    dataType: 'json',
                    success: function (data) {
                        $("body").find(".btnBack").css({
                            visibility: "visible"
                        });
                        console.log(data);
                        graphOneCol = new ArrayToGraph(data, "Quantidade de dispositipos ativos na Antena:", nomeAntena, local, "column");
                        graphOneCol.clickToBarGraph(2);
                        graphOneCol.createArrayToGraphOneBar();
                $("body").find('.selectpicker').selectpicker('refresh');
                    },
                    error: function (error) {
                        console.log(JSON.stringify(error));
                    }
                });
                break;
        }

    });

    $("body").on("click", "span", function () {
        var nome_antena = "ant-NelsonIPT";
        var tipo = "Ap"
        //criarLightBox("AntDetail");
        $.ajax({
            type: "GET",
            url: "/getAtives/" + tipo + "/" + nome_antena,
            dataType: 'json',
            success: function (data) {
                console.log(data);
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    });


    $("body").on("click", "#btnBackEstatistica", function () {
        arrayGraph = null;
        carregarDivEstatistica();
        $("body").find(".btnBack").css({
            visibility: "hidden"
        });
    });

    $("body").on("click", "#btnBackStus", function () {
        carregarDivStatus();
        $("body").find(".btnBack").css({
            visibility: "hidden"
        });
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
    if (arrayHosts != null) {
        arrayHosts.stopIntervalGraph();
    }
    $(".mdl-layout-title").html(name);
    lastDisp = "";
    lastAntena = "";
    var page = page; //data-page
    if ($("#contentor-principal").data("page") != page) {
        $("#contentor-principal").data("page", page);
        $("#contentor-principal").hide(efectDiv, timeEfect, function () {
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
    console.log("Carregar Status!");
    $.ajax({
        type: "GET",
        url: "/getAntenasAtivas",
        dataType: 'json',
//        async: false,
        success: function (data) {
            antenas = new HostArray("divAntenas", data);
            antenas.setImage(0);
            antenas.listaHost();
            $("#contentor-principal").show(efectDiv, timeEfect);
            // para aparecer a div com os resultados
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
                $('#selectDisp > select.selectpicker').prop('disabled', true).selectpicker('refresh');
                $('#antenasAtivas > select.selectpicker').prop('disabled', true).selectpicker('refresh');
                $("body").find("#chartContainer").append("<div class='jumbotron'><h2>N&atilde;o existem antenas ativas de momento</h2></div>");

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
    $.ajax({
        type: "GET",
        url: "/getTodasAntenas",
        dataType: 'json',
        success: function (data) {
            antenas = new HostArray("chartContainer", data);
            antenas.setImage(0);
            antenas.listaHost();
            $("#contentor-principal").show(efectDiv, timeEfect);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });


//    $.ajax({
//        type: "GET",
//        url: "/getAllAntenasAndDisps",
//        dataType: 'json',
//        success: function (data) {
//            arrayGraph = new ArrayToGraph(data, "Quantidade de Dispositivos / Antena", "", "chartContainer", "column");
//
//            // para aparecer a div com os resultados
//            $("#contentor-principal").show(efectDiv, timeEfect);
//            arrayGraph.createArrayToGraphTwoBar();
//
//        },
//        error: function (error) {
//            console.log(JSON.stringify(error));
//        }
//    });
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
    // faz o pedido a base de dados de acordo com o tipo dos dispositivos
    if (lastDisp != disp || lastAntena != antena) {
        lastDisp = disp;
        lastAntena = antena;
        $.ajax({
            type: "GET",
            url: "/getDispsActive/" + disp + "/" + antena,
            dataType: 'json',
            success: function (data) {
                if (arrayHosts != null) {
                    arrayHosts.stopIntervalGraph();
                }
                arrayHosts = new TransformArray(data, antena, disp);
                arrayHosts.updateGraph();
                arrayHosts.updateIntervalGraph();
                arrayHosts.graph("chartContainer");
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
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
    var map = new google.maps.Map($("body").find("#map")[0], {
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
//    autoCenter(markers, map);
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

function codeLatLng(lat, lon) {
    var latlng = new google.maps.LatLng(lat, lon);
    geocoder.geocode({'location': latlng}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                map.setZoom(11);
                marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });
                infowindow.setContent(results[1].formatted_address);
                infowindow.open(map, marker);
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}
;

function criarLightBox(divNome) {
    $("body").append("<div id='hover'></div>");
    $("body").append("<div id='popup'><div id='" + divNome + "' class='esticar-vertical'></div><div id='close'>X</div></div>");
}

function carregarDispAtivos(div, nomeAntena) {
    $.ajax({
        type: "GET",
        url: "/GetDeviceByAntena/" + nomeAntena,
        dataType: 'json',
        success: function (data) {
            for (var cli in data[0]) {
                if (data[0][cli].nameVendor != "undefined") {
                    $.ajax({
                        type: "GET",
                        url: "/getFabLogo/" + data[0][cli].nameVendor,
                        dataType: 'json',
                        success: function (data) {

                        },
                        error: function (error) {
                            console.log(JSON.stringify(error));
                        }
                    });

                }
                $("body").find("#" + div).append("<div class='DispDescript mdl-color--white mdl-shadow--2dp'>Mac.Address: " + data[0][cli].macAddress + " Data: " + data[0][cli].data + " Fabricante: " + data[0][cli].nameVendor + "  </div>");
            }
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });

}