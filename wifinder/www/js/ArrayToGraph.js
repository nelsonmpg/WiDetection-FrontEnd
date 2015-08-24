/**
 * @param {type} array
 * @param {type} local
 * @param {type} type
 * @returns {ArrayToGraph}
 */
var ArrayToGraph = function (array, local, type) {
  this.array = array;
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

ArrayToGraph.prototype.createArrayToGraphLine = function () {
  var self = this;
  for (var i in this.array.disp) { // por sensor
    var datapoint = [];
    for (var a in this.array.disp[i].values) {
      datapoint.push({
        x: new Date(this.array.disp[i].values[a].Last_time * 1000),
        y: this.array.disp[i].values[a].Power * 1
      });
    }

    datapoint = _(datapoint).sortBy(function (point) {
      return point.x;
    });
    self.dataTograph.push({
      type: self.type,
      name: this.array.disp[i].name,
      showInLegend: true,
      dataPoints: datapoint
    });
  }
  this.createAndShowGraphLine(this.dataTograph);
};

ArrayToGraph.prototype.createArrayToGraphOneBar = function () {
  var datapoint = [];
  for (var i in this.array) {
    datapoint.push({y: this.array[i].reduction.length, label: this.array[i].group});
  }
  this.dataTograph.push({
    type: this.type,
    dataPoints: datapoint
  });
  this.createAndShowGraphOneBar(this.dataTograph);
};

ArrayToGraph.prototype.createArrayToGraphTwoBar = function () {
  var pointsDisp = [];
  var pointsAp = [];
  var self = this;
  for (var i in this.array) {
    pointsDisp.push({
      label: this.array[i].DISP.nome,
      y: 1 * this.array[i].DISP.count
    });
    pointsAp.push({
      label: this.array[i].AP.nome,
      y: 1 * this.array[i].AP.count
    });
  }

  this.dataTograph = [{
      type: this.type,
      name: "Dispositivos Moveis",
      legendText: "Dispositivos Moveis",
      showInLegend: true,
      dataPoints: pointsDisp
    }, {
      type: this.type,
      name: "Access Points",
      legendText: "Access Points",
      axisYType: "secondary",
      showInLegend: true,
      dataPoints: pointsAp
    }];
  this.createAndShowGraphTwoBars(this.dataTograph);
};

ArrayToGraph.prototype.updateNumDisp = function (data) {
  console.log("Disp");
  console.log(data);
  for (var j in this.dataTograph[0].dataPoints) {
    for (var i in data.new_val.disp) {
      if (data.new_val.disp[i].name == this.dataTograph[0].dataPoints[j].label) {
        this.dataTograph[0].dataPoints[j].y = this.dataTograph[0].dataPoints[j].y + 1;
        this.chart.render();
      }
    }
  }
};

ArrayToGraph.prototype.updateNumAp = function (data) {
  console.log("Ap");
  console.log(data);
  for (var j in this.dataTograph[0].dataPoints) {
    for (var i in data.new_val.disp) {
      if (data.new_val.disp[i].name == this.dataTograph[1].dataPoints[j].label) {
        this.dataTograph[1].dataPoints[j].y = this.dataTograph[1].dataPoints[j].y + 1;
        this.chart.render();
      }
    }
  }
};

ArrayToGraph.prototype.updateSensor = function (data) {
  console.log(this.dataTograph);
  this.dataTograph[0].dataPoints.push({
    label: data.new_val.nomeAntena,
    y: 0
  });

  this.dataTograph[1].dataPoints.push({
    label: data.new_val.nomeAntena,
    y: 0
  });

  this.chart.render();
};

ArrayToGraph.prototype.createAndShowGraphTwoBars = function (dataVelues) {
  var self = this;
  if (this.array.length > 4) {
    this.anguloX = -30;
  }
  this.chart = new CanvasJS.Chart(this.local, {
    zoomEnabled: true,
    exportEnabled: true,
    theme: "theme2",
    animationEnabled: true,
    toolTip: {
      shared: true
    },
    axisY: {
      title: "Wireless Devices",
      titleFontSize: 20,
      titleFontColor: "black"
    },
    axisY2: {
      title: "Access Points",
      titleFontSize: 20,
      titleFontColor: "black"
    },
    axisX: {
      labelAngle: this.anguloX,
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

ArrayToGraph.prototype.createAndShowGraphLine = function (dataValues) {
  var self = this;
  this.chart = new CanvasJS.Chart(this.local, {
    zoomEnabled: true,
    exportEnabled: true,
    animationEnabled: true,
    theme: "theme3",
    legend: {
      verticalAlign: "center",
      horizontalAlign: "right",
      cursor: "pointer", itemclick: function (e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        }
        else {
          e.dataSeries.visible = true;
        }
        self.chart.render();
      }
    },
    axisX: {
      gridColor: "Silver",
      tickColor: "silver",
      valueFormatString: "H:mm:ss"
    },
    toolTip: {
      shared: true
    },
    axisY: {
      gridColor: "Silver",
      tickColor: "silver"
    },
    data: dataValues
  });
  self.chart.render();
};

ArrayToGraph.prototype.createAndShowGraphOneBar = function (dataValues) {
  var self = this;
  this.chart = new CanvasJS.Chart(this.local, {
    animationEnabled: true,
    theme: "theme3",
    axisX: {
      interval: 1,
      labelAngle: -70,
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    axisY: {
      gridThickness: 1,
      interval: 1,
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    legend: {
      verticalAlign: "bottom",
      horizontalAlign: "center"
    },
    data: dataValues
  });
  this.chart.render();
};