var ArrayToGraph = function (array, titulo, subtitulo, local, type) {
    this.array = array;
    this.titulo = titulo;
    this.subtitulo= subtitulo;
    this.local = local;
    this.type = type;
    this.valuesGraphToBars = [];
    this.chart = null;
    this.dataTograph = [];
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
                self.clickToBarGraph(e.dataPoint.label);
            },
            dataPoints: pointsGraph
        }];
    this.createAndShowGraphOneBar(this.dataTograph);
};

ArrayToGraph.prototype.clickToBarGraph = function (bar) {
    var query = "/getHostbyTipoNome/" + ((bar == "AP") ? "AP/" : "DISP/") + this.titulo;
    $.ajax({
        type: "GET",
        url: query,
        dataType: 'json',
        success: function (data) {
            console.log(data);
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
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
            graphOneCol = new ArrayToGraph(data,"Quantidade de dispositipos encontrados na Antena:",  event, "chartContainer", "column");
            graphOneCol.createArrayToGraphOneBar();
            $("body").find("#btnBack").css({
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
        subtitles: [{
                text: self.subtitulo
            }],
        data: dataValues
    });
    this.chart.render();
};