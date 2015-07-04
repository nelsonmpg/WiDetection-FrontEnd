
$(document).ready(function () {
    var socket = io.connect(window.location.href);

$("#updatePrefix").click(function (){
    $.getJSON("/updatePrefix", function (data) {
            console.log("success");
            $("#result").append(JSON.stringify(data) + "<br>");
        }).fail(function () {
            console.log("error");
        });
});

    $("#getClientes").click(function () {
        $.getJSON("/getClientes/Clientes/cliente/48:5D:60:3C:32:44", function (data) {
            console.log("success");
            $("#result").html(JSON.stringify(data));
        }).done(function () {
            console.log("second success");
        }).fail(function () {
            console.log("error");
        }).always(function () {
            console.log("complete");
        });

//        $.ajax({
//            type: "GET",
//            url: "/getClientes/Clientes/cliente/48:5D:60:3C:32:44",
//            dataType: 'json',
//            success: function (data) {
//                $("#result").html(JSON.stringify(data));
//            },
//            error: function (error) {
//                console.log(JSON.stringify(error));
//            }
//        });
    });
});
