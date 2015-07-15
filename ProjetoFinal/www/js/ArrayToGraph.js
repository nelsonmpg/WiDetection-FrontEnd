var ArrayToGraph = function (array, titulo, local) {
    this.array = array;
    this.titulo = titulo;
    this.local = local;
    this.valuesGraphToBars = [];
    this.chart = null;
};

ArrayToGraph.prototype.createArrayToGraphTwoBar = function () {
    var pointsAp = [];
    var pointsDisp = [];
    for (var i in this.array) {
        pointsAp.push({
            label: this.array[i].AP.nome,
            y: 1 * this.array[i].AP.count
        });
        pointsDisp.push({
            label: this.array[i].DISP.nome,
            y: 1 * this.array[i].DISP.count
        });
    }
    var dataTograph = [{
            type: "column",
            name: "Access Points",
            legendText: "Access Points",
            showInLegend: true,
            dataPoints: pointsAp
        }, {
            type: "column",
            name: "Dispositivos Moveis",
            legendText: "Dispositivos Moveis",
            axisYType: "secondary",
            showInLegend: true,
            dataPoints: pointsDisp
        }];
    this.createAndShowGraph(dataTograph);
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
            interval: 1,
            labelFontFamily: "verdana",
            labelFontColor: "black"
        },
        data: dataVelues,
        legend: {
            cursor: "pointer",
            itemclick: function (e) {
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