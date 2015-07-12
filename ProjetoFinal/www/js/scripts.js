var updateInterval = 1000;
var arrayHosts = null;
var dps = [];
var dataLength = 100;
var timeEfect = 200;

// blind, bounce, clip, drop, explode, fold, highlight, puff, pulsate, shake, slide
var efectDiv = "drop";


$(document).ready(function () {
    var socket = io.connect(window.location.href);

    $("body").find("#contentor-principal").css({
        height: $("body").height() * 0.876
    });

    showPageToDiv("status.html", "Status");

    $("body").on("click", ".addNewPAge", function () {
        showPageToDiv($(this).data("page"), $(this).data("name"));
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
});

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
                    $("#contentor-principal").show(efectDiv, timeEfect);
                    switch (page) {
                        case "status.html":
                            break;
                        case "Dashboard.html":
                            $("body").find('.selectpicker').selectpicker();
                            break;
                        case "Estatistica.html":
                            break;
                        case "Acerca_De.html":
                            break;
                    }
                }, 
                error: function (err) {
                    alert("error " + err);
                },
                complete : function (){
                    alert("finished");
                }
            });

//            $.get("./html/" + page, function (data) {
//                $("#contentor-principal").html(data);
//                $("#contentor-principal").show(efectDiv, timeEfect);
//                switch (page) {
//                    case "status.html":
//                        break;
//                    case "Dashboard.html":
//                        $("body").find('.selectpicker').selectpicker();
//                        break;
//                    case "Estatistica.html":
//                        break;
//                    case "Acerca_De.html":
//                        break;
//                }
//            }).fail(function () {
//                alert("error");
//            }).always(function () {
//                //alert("finished");
//            });
        });
    }
}