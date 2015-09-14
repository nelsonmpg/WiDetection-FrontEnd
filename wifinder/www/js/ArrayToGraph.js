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
  this.theme = "theme2";
  this.scalegraph = 1;
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
  this.createAndShowGraphLine();
};

ArrayToGraph.prototype.createArrayToGraphSimpleLine = function () {
  var self = this;
  var datapoint = [];
  for (var i in this.array) {
    datapoint.push({
      x: new Date(this.array[i].x),
      y: this.array[i].y
    });
  }
  self.dataTograph.push({
    type: this.type,
    lineThickness: 3,
    dataPoints: datapoint
  });
  this.createAndShowGraphSimpleLine();
};

ArrayToGraph.prototype.updateGraphSimpleLine = function (data) {
  var self = this;
  self.chart.options.data[0].dataPoints.push({
    x: new Date(data.x),
    y: data.y * 1
  });
  self.chart.options.data[0].dataPoints.shift();
  self.chart.render();
};

ArrayToGraph.prototype.createArrayToGraphOneBar = function () {
  var datapoint = [];
  for (var i in this.array) {
    (this.array[i].reduction.length > 20 ? this.scalegraph = 3 : 1);
    datapoint.push({
      y: this.array[i].reduction.length,
      label: (this.array[i].group == "") ? "Unknown" : this.array[i].group
    });
  }
  this.dataTograph.push({
    type: this.type,
    dataPoints: datapoint
  });
  this.createAndShowGraphOneBar();
};

ArrayToGraph.prototype.createArrayToGraphOneBar2 = function () {
  var datapoint = [];
  for (var i in this.array) {
    datapoint.push({
      label: i,
      y: this.array[i].length * 1
    });
  }
  this.dataTograph.push({
    type: this.type,
    dataPoints: datapoint
  });
  this.createAndShowGraphOneBar();
};

ArrayToGraph.prototype.createArrayToGraphOneBar3 = function () {
  var datapoint = [];
  for (var i in this.array) {
    datapoint.push({
      label: i,
      y: this.array[i] * 1
    });
  }
  this.dataTograph.push({
    type: this.type,
    dataPoints: datapoint
  });
  this.createAndShowGraphOneBar();
};


ArrayToGraph.prototype.createArrayToGraphTwoBar = function () {
  try {
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
        name: "Wireless Devices",
        legendText: "Wireless Devices",
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
    this.createAndShowGraphTwoBars();
  } catch (err) {
    console.log(err);
  }
};

ArrayToGraph.prototype.getValSensor = function (snsr) {
  var val = {};
  for (var j in this.dataTograph[0].dataPoints) {
    if (snsr == this.dataTograph[0].dataPoints[j].label) {
      val = {
        "numap": this.dataTograph[1].dataPoints[j].y,
        "numdisp": this.dataTograph[0].dataPoints[j].y
      };
      break;
    }
  }
  return val;
};

ArrayToGraph.prototype.updateNumDisp = function (data) {
  for (var j in this.dataTograph[0].dataPoints) {
    if (data.sensor == this.dataTograph[0].dataPoints[j].label) {
      this.dataTograph[0].dataPoints[j].y = data.hosts_new;
      this.chart.render();
    }
  }
};

ArrayToGraph.prototype.updateNumAp = function (data) {
  for (var j in this.dataTograph[1].dataPoints) {
    if (data.sensor == this.dataTograph[1].dataPoints[j].label) {
      this.dataTograph[1].dataPoints[j].y = data.hosts_new;
      this.chart.render();
    }
  }
};

ArrayToGraph.prototype.updateSensor = function (data) {
  this.dataTograph[0].dataPoints.push({
    label: data,
    y: 0
  });

  this.dataTograph[1].dataPoints.push({
    label: data,
    y: 0
  });

  this.chart.render();
};

ArrayToGraph.prototype.createAndShowGraphTwoBars = function () {
  var self = this;
  if (self.dataTograph[0].dataPoints.length > 4) {
    this.anguloX = -30;
  }
  this.chart = new CanvasJS.Chart(this.local, {
    zoomEnabled: true,
    exportEnabled: true,
    theme: self.theme,
    animationEnabled: true,
    toolTip: {
      shared: true
    },
    axisY: {
//      interval: self.scalegraph,
      title: "Wireless Devices",
      titleFontSize: 20,
      titleFontColor: "black"
    },
    axisY2: {
//      interval: self.scalegraph,
      title: "Access Points",
      titleFontSize: 20,
      titleFontColor: "black"
    },
    axisX: {
      labelAngle: this.anguloX,
      labelFontSize: 14,
      titleFontSize: 20,
      interval: 1, 
      labelFontFamily: "verdana",
      labelFontColor: "black",
      titleFontColor: "black"
    },
    data: self.dataTograph,
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

ArrayToGraph.prototype.createAndShowGraphLine = function () {
  var self = this;
  this.chart = new CanvasJS.Chart(this.local, {
    zoomEnabled: true,
    exportEnabled: true,
    animationEnabled: true,
    theme: self.theme,
    legend: {
      verticalAlign: "center",
      horizontalAlign: "right",
      cursor: "pointer", itemclick: function (e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
        self.chart.render();
      }
    },
    axisX: {
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black",
      valueFormatString: "H:mm:ss"
    },
    toolTip: {
      shared: true
    },
    axisY: {
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    data: self.dataTograph
  });
  self.chart.render();
};

ArrayToGraph.prototype.createAndShowGraphOneBar = function () {
  var self = this;
  if (self.dataTograph[0].dataPoints.length > 3) {
    this.anguloX = -50;
  }
  this.chart = new CanvasJS.Chart(this.local, {
    animationEnabled: true,
    theme: self.theme,
    axisX: {
      labelAutoFit: true,
      labelMaxWidth: 150,
      labelWrap: false,
      interval: 1,
      labelAngle: self.anguloX,
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    axisY: {
      gridThickness: 1,
//      interval: self.scalegraph,
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    legend: {
      verticalAlign: "bottom",
      horizontalAlign: "center"
    },
    data: self.dataTograph
  });
  this.chart.render();
};

ArrayToGraph.prototype.createAndShowGraphSimpleLine = function () {
  var self = this;
  self.chart = new CanvasJS.Chart(self.local, {
    theme: self.theme,
    animationEnabled: true,
    axisX: {
      valueFormatString: "HH:mm",
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    axisY: {
      includeZero: false,
      gridThickness: 1,
//      interval: self.scalegraph,
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    data: self.dataTograph
  });
  self.chart.render();
};