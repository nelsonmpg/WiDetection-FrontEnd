//var chart = null;
//var oneGraph = false;
//var showNewGraph = false;
//var graphSelect = "";
//var updateInterGraph = null;

var TransformArray = function (array, antena, tipoDisp) {
    this.array = array;
    this.antena = antena.replace(/(\r\n|\n|\r)/gm, "").trim();
    this.tipoDisp = tipoDisp.replace(/(\r\n|\n|\r)/gm, "").trim();
    this.dataLength = 500;
    this.updateInterval = 1000;
    this.listaHostsAndStartValues = [];
    this.graphAllDisps = [];

//    console.log(this.inicializaArray());

//    this.valuesToGraph = [];
//    this.localGraph;
//    this.showNewGraph;
//    this.timeRemove = 5;

    this.createListaHostAndStartValues(this.array);

//    this.valsAllGraph();
//    this.allHosts();
};

TransformArray.prototype.createListaHostAndStartValues = function (lista) {
    for (var i in lista) {
        var graphDisp = this.inicializaArray();
        graphDisp.push({
            x: new Date(),
            y: 1 * lista[i].Power
        });
        if (graphDisp.length > this.dataLength) {
            graphDisp.shift();
        }
        this.listaHostsAndStartValues[lista[i].macAddress] = {
            Power: lista[i].Power,
            data: lista[i].data,
            macAddress: lista[i].macAddress,
            nameVendor: lista[i].nameVendor,
            listaValues: graphDisp
        };
    }
};

TransformArray.prototype.updateListaHostAndStartValues = function (newValues) {
    for (var i in newValues.host) {
        var val = this.listaHostsAndStartValues[newValues.host[i].macAddress];
        var graphDisp = val.listaValues;
        graphDisp.push({
            x: new Date(),
            y: 1 * newValues.host[i].Power
        });
        if (graphDisp.length > this.dataLength) {
            graphDisp.shift();
        }
        this.listaHostsAndStartValues[newValues.host[i].macAddress] = {
            Power: newValues.host[i].Power,
            data: newValues.host[i].data,
            macAddress: newValues.host[i].macAddress,
            nameVendor: newValues.host[i].nameVendor,
            listaValues: graphDisp
        }; 
    }
};

TransformArray.prototype.updateArrayTransform = function (disp, values) {
    if (disp.replace(/(\r\n|\n|\r)/gm, "").trim() == this.tipoDisp &&
            values.new_val.nomeAntena.replace(/(\r\n|\n|\r)/gm, "").trim() == this.antena) {
        if (this.listaHostsAndStartValues.length = values.new_val.host.length) {
            this.updateListaHostAndStartValues(values.new_val);
            console.log(this.listaHostsAndStartValues);
        }
    }
};

//TransformArray.prototype.valsAllGraph = function () {
//    for (var i in this.array) {
//        for (var j in this.array[i].disp) {
//            if (this.array[i].disp[j].name.replace(/(\r\n|\n|\r)/gm, "") == this.antena) {
//                var graphDisp = this.inicializaArray();
//                for (var k in this.array[i].disp[j].values) {
//                    graphDisp.push({
//                        x: new Date(),
//                        y: 1 * this.array[i].disp[j].values[k].Power
//                    });
//                    if (graphDisp.length > this.dataLength) {
//                        graphDisp.shift();
//                    }
//                }
//                this.graphAllDisps[this.array[i].macAddress] = graphDisp;
//            }
//        }
//    }
//};

TransformArray.prototype.updateGraph = function (data, update) {
    var graphDisp = [];
    for (var i in this.array) {
        if (update) {
            if (this.array[i].macAddress == data.new_val.macAddress) {
                this.array[i].disp = data.new_val.disp;
                console.log(this.array[i].macAddress);
            }
        }
        for (var j in this.array[i].disp) {
            if (this.array[i].disp[j].name.replace(/(\r\n|\n|\r)/gm, "") == this.antena) {
                var graphDisp = (this.graphAllDisps[this.array[i].macAddress] == "undefined") ? this.inicializaArray() : this.graphAllDisps[this.array[i].macAddress];
                graphDisp.push({
                    x: new Date(),
                    y: 1 * this.array[i].disp[j].values[this.array[i].disp[j].values.length - 1].Power
                });
                if (graphDisp.length > this.dataLength) {
                    graphDisp.shift();
                }
                this.graphAllDisps[this.array[i].macAddress] = graphDisp;
            }
        }
    }
    this.createUpdateScaleGraph();
};

TransformArray.prototype.createUpdateScaleGraph = function () {
    this.valuesToGraph = [];
    if (!oneGraph) {
        for (var i in this.graphAllDisps) {
            var val = {
                type: "line",
                xValueType: "dateTime",
                lineThickness: 3,
                name: i,
                click: function (e) {
                    oneGraph = true;
                    showNewGraph = true;
                    graphSelect = e.dataSeries.name;
                },
                dataPoints: this.graphAllDisps[i]
            };
            this.valuesToGraph.push(val);
        }
    } else {
//        var valPower = this.graphAllDisps[graphSelect][this.graphAllDisps[graphSelect].length - 1].y;
        var val = {
            type: "line",
            xValueType: "dateTime",
            showInLegend: true,
            lineThickness: 5,
//            legendText: graphSelect + " " + valPower,
            name: graphSelect,
            click: function (e) {
                oneGraph = false;
                showNewGraph = true;
                graphSelect = "";
            },
            dataPoints: this.graphAllDisps[graphSelect]
        };
//        chart.options.data[0].legendText = valPower;
        this.valuesToGraph.push(val);
//        console.log(this.allhosts[graphSelect]);
    }
    if (showNewGraph) {
        chart = null;
        this.graph(this.localGraph);
        showNewGraph = false;
    }
};

TransformArray.prototype.graph = function (local) {
    this.localGraph = local;
    chart = new CanvasJS.Chart(this.localGraph, {
//        zoomEnabled: true,
//        theme: "theme3",
        animationEnabled: true,
        theme: "theme4",
        title: {
            text: "Power dos Dispositivos Encontrados",
            fontSize: 22
        },
        subtitles: [{
                text: this.antena,
                //Uncomment properties below to see how they behave
                //fontColor: "red",
                fontSize: 18
            }],
        toolTip: {
            shared: true
        },
        axisY: {
            title: "Power",
            gridThickness: 0.2,
            labelFontSize: 14,
            suffix: " dBm",
            labelFontFamily: "verdana",
            labelFontColor: "black"
        },
        axisX: {
            valueFormatString: "H:mm:ss",
            interval: 5,
            labelAngle: -50,
            labelFontSize: 14,
            title: "Tempo",
            labelFontFamily: "verdana",
            labelFontColor: "black"
        },
        data: this.valuesToGraph,
        legend: {
            horizontalAlign: "right", // left, center ,right 
            verticalAlign: "center", // top, center, bottom,
            fontSize: 14,
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
};

TransformArray.prototype.updateIntervalGraph = function () {
    var self = this;
    updateInterGraph = setInterval(function () {
        self.updateGraph("", false);
        if (chart != null) {
            chart.render();
        }
    }, updateInterval);
};

TransformArray.prototype.stopIntervalGraph = function () {
    clearInterval(updateInterGraph);
};

TransformArray.prototype.diffDates = function (last_date) {
    var start_actual_time = last_date;
    var end_actual_time = new Date().toLocaleString();

    start_actual_time = new Date(start_actual_time);
    end_actual_time = new Date(end_actual_time);

    var diff = end_actual_time - start_actual_time;

    var diffSeconds = diff / 1000;
    var HH = Math.floor(diffSeconds / 3600);
    var MM = Math.floor(diffSeconds % 3600) / 60;

//    var formatted = ((HH < 10) ? ("0" + HH) : HH) + " : " + ((MM < 10) ? ("0" + MM) : MM);
    return ((HH > 0) ? true : (MM > this.timeRemove) ? true : false);
};

TransformArray.prototype.inicializaArray = function () {
    var d = new Date().getTime();
    var newTime = d - (this.dataLength * 1000);
    var vals = [];
    for (var i = 0; i < this.dataLength; i++) {
        vals.push({
            x: new Date(newTime + (i * 1000)),
            y: -127
        });
    }
    return vals;
};