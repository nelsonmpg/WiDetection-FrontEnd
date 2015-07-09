
var updateInterval = 1000;
//var dataLength = 350; // number of dataPoints visible at any point
var disps = []; // dataPoints

var arrayHosts = null;
var dps = [];
var dataLength = 100;

$(document).ready(function () {
    var socket = io.connect(window.location.href);

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


});