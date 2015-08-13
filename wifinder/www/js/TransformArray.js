/**
 * 
 * @param {type} array
 * @param {type} antena
 * @param {type} tipoDisp
 * @returns {TransformArray}
 */
var TransformArray = function (array, antena, tipoDisp, local) {
    this.array = array;
    this.antena = antena.replace(/(\r\n|\n|\r)/gm, "").trim();
    this.tipoDisp = tipoDisp.replace(/(\r\n|\n|\r)/gm, "").trim();
    this.dataLength = 200;
    this.updateInterval = 1000;
    this.listaHostsStartAndUpdateValues = [];
    this.graphAllDisps = [];
    this.valuesToGraph = [];
    this.localGraph = local;
    this.chart = null;
    this.oneGraph = false;
    this.graphSelect;
    this.showNewGraph = false;
    this.lastSizeListArray = 1;
    this.timeRemove = 5;
    this.updateInterGraph = null;

    this.createAndUpdateListaHostAndValues(this.array);
};

TransformArray.prototype.createAndUpdateListaHostAndValues = function (lista) {
    for (var i in lista) {
        if (!this.diffDates(lista[i].data)) {
            var val = this.listaHostsStartAndUpdateValues[lista[i].macAddress];
            var graphDisp = (typeof val == "undefined") ? this.inicializaArray() : val.listaValues;
            graphDisp.push({
                x: new Date(),
                y: 1 * lista[i].Power
            });
            if (graphDisp.length > this.dataLength) {
                graphDisp.shift();
            }
            this.listaHostsStartAndUpdateValues[lista[i].macAddress] = {
                Power: lista[i].Power,
                data: lista[i].data,
                macAddress: lista[i].macAddress,
                nameVendor: lista[i].nameVendor,
                listaValues: graphDisp
            };
        }
    }
    var sizeArr = this.countHosts(this.listaHostsStartAndUpdateValues);
    if (this.lastSizeListArray != sizeArr) {
        this.lastSizeListArray = sizeArr;
        this.showNewGraph = true;
    }
};

TransformArray.prototype.updateArrayTransform = function (disp, values) {
    if (disp.replace(/(\r\n|\n|\r)/gm, "").trim() == this.tipoDisp &&
            values.new_val.nomeAntena.replace(/(\r\n|\n|\r)/gm, "").trim() == this.antena) {
        this.createAndUpdateListaHostAndValues(values.new_val.host);
    }
};

TransformArray.prototype.updateGraph = function () {
    for (var i in this.listaHostsStartAndUpdateValues) {
        var val = this.listaHostsStartAndUpdateValues[i];
        var graphDisp = val.listaValues;
        graphDisp.push({
            x: new Date(),
            y: 1 * val.Power
        });
        if (graphDisp.length > this.dataLength) {
            graphDisp.shift();
        }
        this.listaHostsStartAndUpdateValues[i] = {
            Power: val.Power,
            data: val.data,
            macAddress: val.macAddress,
            nameVendor: val.nameVendor,
            listaValues: graphDisp
        };
    }
    this.createUpdateScaleGraph();
};

TransformArray.prototype.createUpdateScaleGraph = function () {
    this.valuesToGraph = [];
    var self = this;
    if (!this.oneGraph) {
        for (var i in this.listaHostsStartAndUpdateValues) {
            var val = {
                type: "line",
                xValueType: "dateTime",
                lineThickness: 3,
                name: i,
                click: function (e) {
                    self.oneGraph = true;
                    self.showNewGraph = true;
                    self.graphSelect = e.dataSeries.name;
                },
                dataPoints: this.listaHostsStartAndUpdateValues[i].listaValues
            };
            this.valuesToGraph.push(val);
        }

    } else {
        var powerVal = this.listaHostsStartAndUpdateValues[this.graphSelect].listaValues[this.dataLength - 1].y;
        var val = {
            type: "line",
            xValueType: "dateTime",
            lineThickness: 3,
            showInLegend: true,
            legendText: this.graphSelect + " " + powerVal,
            name: this.graphSelect,
            toolTipContent: "<span>MacAddress: {name}</span><br>" +
                    "<span>Power: {y}</span><br>" +
                    "<span>Hora: {x}</span><br>" +
                    "<span>Fabricante: " + this.listaHostsStartAndUpdateValues[this.graphSelect].nameVendor + "</span>",
            click: function (e) {
                self.oneGraph = false;
                self.showNewGraph = true;
                self.graphSelect = "";
            },
            dataPoints: this.listaHostsStartAndUpdateValues[this.graphSelect].listaValues
        };
        this.chart.options.data[0].legendText = this.graphSelect + " " + powerVal;
        this.valuesToGraph.push(val);
    }
    if (this.showNewGraph && this.chart != null) {
        this.stopIntervalGraph();
        this.chart = null;
        this.graph(this.localGraph);
        this.showNewGraph = false;
        this.updateIntervalGraph();
    }
};

TransformArray.prototype.graph = function () {
//    this.localGraph = local;
    var self = this;
    this.chart = new CanvasJS.Chart(this.localGraph, {
        zoomEnabled: true,
        exportEnabled: true,
        animationEnabled: true,
        theme: "theme3",
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
                self.chart.render();
            }
        }
    });
    this.chart.render();
};

TransformArray.prototype.updateIntervalGraph = function () {
    var self = this;
    this.updateInterGraph = setInterval(function () {
        self.updateGraph();
        self.chart.render();
    }, self.updateInterval);
};

TransformArray.prototype.stopIntervalGraph = function () {
    clearInterval(this.updateInterGraph);
};

TransformArray.prototype.diffDates = function (last_date) {
    var start_actual_time = last_date;
    var end_actual_time = new Date();

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
            y: 0
        });
    }
    return vals;
};

TransformArray.prototype.countHosts = function (list) {
    var a = 0;
    for (var i in list) {
        a++;
    }
    return a;
};