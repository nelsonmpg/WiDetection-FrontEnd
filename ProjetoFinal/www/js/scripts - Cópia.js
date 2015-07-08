//Better to construct options first and then pass it as a parameter
var options = {
    title: {
        text: "Annual Expenses"
    },
    animationEnabled: true,
    axisY: {
        includeZero: false,
        prefix: "$ "
    },
    toolTip: {
        shared: true,
        content: "<span style='\"'color: {color};'\"'><strong>{name}</strong></span> <span style='\"'color: dimgrey;'\"'>${y}</span> "
    },
    legend: {
        fontSize: 14
    },
    data: [
        {
            type: "splineArea",
            showInLegend: true,
            name: "Salaries",
            color: "rgba(54,158,173,.6)",
            dataPoints: [
                {x: new Date(2012, 2), y: 30000},
                {x: new Date(2012, 3), y: 35000},
                {x: new Date(2012, 4), y: 30000},
                {x: new Date(2012, 5), y: 30400},
                {x: new Date(2012, 6), y: 20900},
                {x: new Date(2012, 7), y: 31000},
                {x: new Date(2012, 8), y: 30200},
                {x: new Date(2012, 9), y: 30000},
                {x: new Date(2012, 10), y: 33000},
                {x: new Date(2012, 11), y: 38000},
                {x: new Date(2013, 0), y: 38900},
                {x: new Date(2013, 1), y: 39000}

            ]
        },
        {
            type: "splineArea",
            showInLegend: true,
            name: "Office Cost",
            color: "rgba(134,180,2,.7)",
            dataPoints: [
                {x: new Date(2012, 2), y: 20100},
                {x: new Date(2012, 3), y: 16000},
                {x: new Date(2012, 4), y: 14000},
                {x: new Date(2012, 5), y: 18000},
                {x: new Date(2012, 6), y: 18000},
                {x: new Date(2012, 7), y: 21000},
                {x: new Date(2012, 8), y: 22000},
                {x: new Date(2012, 9), y: 25000},
                {x: new Date(2012, 10), y: 23000},
                {x: new Date(2012, 11), y: 25000},
                {x: new Date(2013, 0), y: 26000},
                {x: new Date(2013, 1), y: 25000}

            ]
        },
        {
            type: "splineArea",
            showInLegend: true,
            name: "Entertainment",
            color: "rgba(194,70,66,.6)",
            dataPoints: [
                {x: new Date(2012, 2), y: 10100},
                {x: new Date(2012, 3), y: 6000},
                {x: new Date(2012, 4), y: 3400},
                {x: new Date(2012, 5), y: 4000},
                {x: new Date(2012, 6), y: 9000},
                {x: new Date(2012, 7), y: 3900},
                {x: new Date(2012, 8), y: 4200},
                {x: new Date(2012, 9), y: 5000},
                {x: new Date(2012, 10), y: 14300},
                {x: new Date(2012, 11), y: 12300},
                {x: new Date(2013, 0), y: 8300},
                {x: new Date(2013, 1), y: 6300}

            ]
        },
        {
            type: "splineArea",
            showInLegend: true,
            color: "rgba(127,96,132,.6)",
            name: "Maintenance",
            dataPoints: [
                {x: new Date(2012, 2), y: 1700},
                {x: new Date(2012, 3), y: 2600},
                {x: new Date(2012, 4), y: 1000},
                {x: new Date(2012, 5), y: 1400},
                {x: new Date(2012, 6), y: 900},
                {x: new Date(2012, 7), y: 1000},
                {x: new Date(2012, 8), y: 1200},
                {x: new Date(2012, 9), y: 5000},
                {x: new Date(2012, 10), y: 1300},
                {x: new Date(2012, 11), y: 2300},
                {x: new Date(2013, 0), y: 2800},
                {x: new Date(2013, 1), y: 1300}

            ]
        }

    ]
};
var xVal = 0;
var yVal = -100;
var updateInterval = 1000;
var dataLength = 350; // number of dataPoints visible at any point
var dps = []; // dataPoints
var dps2 = []; // dataPoints
var dps3 = []; // dataPoints

$(document).ready(function () {
    var socket = io.connect(window.location.href);
    $("#updatePrefix").click(function () {
//    $.getJSON("/updatePrefix", function (data) {
//            console.log("success");
//            $("#result").append(JSON.stringify(data) + "<br>");
//        }).fail(function () {
//            console.log("error");
//        });
//        
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
    socket.on('newDevice', function (data) {
//        console.log(data.new_val.disp);
    });
    
    $("#chartContainer").CanvasJSChart(options);
    
    var updateChart = function (count) {
        count = count || 1;
        // count is number of times loop runs to generate random dataPoints.
        for (var j = 0; j < count; j++) {
//            yVal = yVal + Math.round(5 + Math.random() * (-5 - 5));
            var d = new Date();
            dps.push({
                x: d,
                y: yVal + Math.round(55 + Math.random() * (-5 - 5))
            });
            dps2.push({
                x: d,
                y: yVal + Math.round(45 + Math.random() * (-5 - 5))
            });
            dps3.push({
                x: d,
                y: yVal + Math.round(15 + Math.random() * (-5 - 5))
            });
            xVal++;
        };
        
        if (dps.length > dataLength) {
            dps.shift();
            dps2.shift();
            dps3.shift();
        }
        // updating legend text with  updated with y Value 
        chart.options.data[0].legendText = " Teste1  " + dps[dps.length - 1].y;
        chart.options.data[1].legendText = " Teste2  " + dps2[dps2.length - 1].y;
        chart.options.data[2].legendText = " Teste3  " + dps3[dps3.length - 1].y;
        chart.render();
    };
    var chart = new CanvasJS.Chart("chartContainer", {
        zoomEnabled: true,
//        theme: "theme3",
        title: {
            text: "Power dos Dispositivos Encontrados"
        },
        toolTip: {
            shared: true
        },
        axisY: {
            title: "Power"
        },
        axisX: {
            valueFormatString: "H:mm:ss",
            interval: 1,
            labelAngle: -50,
            title: "Tempo"
        },
        data: [{
                type: "line",
                xValueType: "dateTime",
                showInLegend: true,
                name: "teste1",
                dataPoints: dps
            }, {
                type: "line",
                xValueType: "dateTime",
                showInLegend: true,
                name: "teste2",
                dataPoints: dps2
            }, {
                type: "line",
                xValueType: "dateTime",
                showInLegend: true,
                name: "teste3",
                dataPoints: dps3
            }],
        legend: {
            horizontalAlign: "right", // left, center ,right 
            verticalAlign: "center", // top, center, bottom,
            fontSize: 20,
            fontWeight: "bold",
            fontFamily: "calibri",
            fontColor: "dimGrey",
            cursor: "pointer",
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                chart.render();
            }
        }
    });
    // generates first set of dataPoints
    updateChart(dataLength);
    // update chart after specified time. 
    setInterval(function () {
        updateChart();
    }, updateInterval);


});
