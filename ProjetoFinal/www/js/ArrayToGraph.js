var ArrayToGraph = function (array, titulo, local, type) {
    this.array = array;
    this.titulo = titulo;
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
            if (e.dataPoint.label == "AP") {
                $.ajax({
                    type: "GET",
                    url: "/getHostbyTipoNome/AP/" + self.titulo,
                    dataType: 'json',
                    success: function (data) {
                        console.log(data);
                    },
                    error: function (error) {
                        console.log(JSON.stringify(error));
                    }
                });
            } else {
                $.ajax({
                    type: "GET",
                    url: "/getHostbyTipoNome/DISP/" + self.titulo,
                    dataType: 'json',
                    success: function (data) {
                        console.log(data);
                    },
                    error: function (error) {
                        console.log(JSON.stringify(error));
                    }
                });
            }
        },
        dataPoints: pointsGraph
    }];
    this.createAndShowGraphOneBar(this.dataTograph);
};

ArrayToGraph.prototype.createArrayToGraphTwoBar = function () {
    var pointsAp = [];
    var pointsDisp = [];
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
            dataPoints: pointsAp
        }, {
            type: this.type,
            name: "Dispositivos Moveis",
            legendText: "Dispositivos Moveis",
            axisYType: "secondary",
            showInLegend: true,
            dataPoints: pointsDisp
        }];
    this.createAndShowGraph(this.dataTograph);
};

ArrayToGraph.prototype.createAndShowGraph = function (dataVelues) {
    var self = this;
    this.chart = new CanvasJS.Chart(this.local, {
        zoomEnabled: true,
        exportEnabled: true,
        theme: "theme1",
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
            labelFontSize: 14
        },
        axisY2: {
            title: "Dispositivos Moveis",
            labelFontSize: 14
        },
        axisX: {
            labelAngle: -50,
            labelFontSize: 14,
            interval: 1, labelFontFamily: "verdana",
            labelFontColor: "black"
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
    console.log(dataValues);
    this.chart = new CanvasJS.Chart(this.local, {
        zoomEnabled: true,
        exportEnabled: true,
        theme: "theme1",
        animationEnabled: true,
        title: {
            text: self.titulo,
            fontSize: 30
        },
        data: dataValues
    });
    this.chart.render();
};