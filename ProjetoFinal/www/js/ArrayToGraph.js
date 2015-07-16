/**
 * @param {type} array
 * @param {type} titulo
 * @param {type} subtitulo
 * @param {type} local
 * @param {type} type
 * @returns {ArrayToGraph}
 */
var ArrayToGraph = function (array, titulo, subtitulo, local, type) {
    this.array = array;
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.local = local;
    this.type = type;
    this.valuesGraphToBars = [];
    this.chart = null;
    this.dataTograph = [];
    this.click = null;
    this.anguloX = 0;
};

ArrayToGraph.prototype.changeAnguloX = function (angulo) {
    this.anguloX = angulo;
};

ArrayToGraph.prototype.createArrayToGraphOneBar = function () {
    var pointsGraph = [];
    var self = this;
    for (var valor in this.array) {
        pointsGraph.push({
            label: this.array[valor][0],
            y: 1 * this.array[valor][1]
        });
    }
    this.dataTograph = [{
            type: this.type, //change type to bar, line, area, pie, etc
            click: function (e) {
                self.click(e.dataPoint.label);
            },
            dataPoints: pointsGraph
        }];
    this.createAndShowGraphOneBar(this.dataTograph);
};

ArrayToGraph.prototype.createArrayToGraphOneBar2 = function () {
    var pointsGraph = [], array_elements = [];
    var self = this;

    for (var valor in this.array) {
        array_elements.push(this.array[valor].nameVendor);
    }

    array_elements.sort();

    var current = "nulll";
    var cnt = 0;
    for (var i = 0; i < array_elements.length; i++) {
        if (array_elements[i].toString().toUpperCase() != current.toString().toUpperCase()) {
            if (cnt > 0) {
                pointsGraph.push({
                    label: current,
                    y: 1 * cnt
                });
            }
            current = array_elements[i];
            cnt = 1;
        } else {
            cnt++;
        }
    }
    if (cnt > 0) {
        pointsGraph.push({
            label: current,
            y: 1 * cnt
        });
    }
    console.log(pointsGraph);
    this.dataTograph = [{
            type: this.type, //change type to bar, line, area, pie, etc
            click: function (e) {
                self.click(e.dataPoint.label);
            },
            dataPoints: pointsGraph
        }];
    this.createAndShowGraphOneBar(this.dataTograph);
};

ArrayToGraph.prototype.clickToBarGraph = function (func) {
    var self = this;
    switch (func) {
        case 0:
            this.click = function (bar) {
                var query = "/getHostbyTipoNome/" + ((bar == "AP") ? "AP/" : "DISP/") + this.subtitulo;
                $.ajax({
                    type: "GET",
                    url: query,
                    dataType: 'json',
                    success: function (data) {
                        self = new ArrayToGraph(data[0], "Fabricantes por Dispositivo na Antena:", self.subtitulo, "chartContainer", "column");
                        self.changeAnguloX(-50);
                        self.createArrayToGraphOneBar2();
                    },
                    error: function (error) {
                        console.log(JSON.stringify(error));
                    }
                });
            };
            break;
        case 1:
            this.click = function (bar) {
                $("body").find("#close").click();
//                alert(bar + " - " + func);
            };
            break;
        case 2:
            self = this;
            this.click = function (bar) {
                var query = "/getAtives/" + ((bar == "AP") ? "AP/" : "DISP/") + this.subtitulo;
                $.ajax({
                    type: "GET",
                    url: query,
                    dataType: 'json',
                    success: function (data) {
                        $("#"+self.local).html("");
                        antenas = new HostArray("#divAntenas", data[0]);
                        antenas.listaAp();
                                                
                    },
                    error: function (error) {
                        console.log(JSON.stringify(error));
                    }
                });
            };
            break;
        default :
            alert(this);
            break;
    }


};

ArrayToGraph.prototype.createArrayToStatusBarGraph = function () {
    var pointsGraph = [];
    var self = this;
    pointsGraph.push({
        label: "AP",
        y: 1 * this.array[0]
    });
    pointsGraph.push({
        label: "Disp",
        y: 1 * this.array[1]
    });
    this.dataTograph = [{
            type: this.type, //change type to bar, line, area, pie, etc
            click: function (e) {
                self.click(e.dataPoint.label);
            },
            dataPoints: pointsGraph
        }];
    this.clickToBarGraph(2);
    this.createAndShowGraphOneBar(this.dataTograph);
};

ArrayToGraph.prototype.createArrayToGraphTwoBar = function () {
    var pointsAp = [];
    var pointsDisp = [];
    var self = this;
    for (var i in this.array) {
        pointsAp.push({
            label: this.array[i].AP.nome,
            y: 1 * this.array[i].AP.count
        });
        pointsDisp.push({label: this.array[i].DISP.nome,
            y: 1 * this.array[i].DISP.count
        });
    }
    this.dataTograph = [{
            type: this.type,
            name: "Access Points",
            legendText: "Access Points",
            showInLegend: true,
            click: function (e) {
                self.clickToDualBarGraph(e.dataPoint.label);
            },
            dataPoints: pointsAp
        }, {
            type: this.type,
            name: "Dispositivos Moveis",
            legendText: "Dispositivos Moveis",
            axisYType: "secondary",
            click: function (e) {
                self.clickToDualBarGraph(e.dataPoint.label);
            },
            showInLegend: true,
            dataPoints: pointsDisp
        }];
    this.createAndShowGraph(this.dataTograph);
};

ArrayToGraph.prototype.clickToDualBarGraph = function (event) {
    $.ajax({
        type: "GET",
        url: "/GetDeviceByAntena/" + event,
        dataType: 'json',
        success: function (data) {
            graphOneCol = new ArrayToGraph(data, "Quantidade de dispositipos encontrados na Antena:", event, "chartContainer", "column");
            graphOneCol.clickToBarGraph(0);
            graphOneCol.createArrayToGraphOneBar();
            $("body").find("#btnBackEstatistica").css({
                visibility: "visible"
            });
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
};

ArrayToGraph.prototype.createAndShowGraph = function (dataVelues) {
    var self = this;
    this.chart = new CanvasJS.Chart(this.local, {
        zoomEnabled: true,
        exportEnabled: true,
        theme: "theme3",
        animationEnabled: true,
        title: {
            text: self.titulo,
            fontSize: 30
        },
        toolTip: {
            shared: true
        },
        axisY: {
            title: "Access Points",
            titleFontSize: 20,
            titleFontColor: "black"
        },
        axisY2: {
            title: "Dispositivos Moveis",
            titleFontSize: 20,
            titleFontColor: "black"
        },
        axisX: {
            title: "Antenas",
            labelAngle: -50,
            labelFontSize: 14,
            titleFontSize: 20,
            interval: 1, labelFontFamily: "verdana",
            labelFontColor: "black",
            titleFontColor: "black"
        },
        data: dataVelues,
        legend: {
            cursor: "pointer", itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                }
                else {
                    e.dataSeries.visible = true;
                }
                self.chart.render();
            }
        }
    });
    this.chart.render();
};

ArrayToGraph.prototype.createAndShowGraphOneBar = function (dataValues) {
    var self = this;
    this.chart = new CanvasJS.Chart(this.local, {
        zoomEnabled: true,
        exportEnabled: true,
        theme: "theme3",
        animationEnabled: true,
        title: {
            text: self.titulo,
            fontSize: 30
        },
        axisX: {
            labelAngle: self.anguloX,
            labelFontSize: 14,
            interval: 1, labelFontFamily: "verdana",
            labelFontColor: "black",
            titleFontColor: "black"
        },
        subtitles: [{
                text: self.subtitulo
            }],
        data: dataValues
    });
    this.chart.render();
};
