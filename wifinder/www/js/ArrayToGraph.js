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
          label: (current == 0) ? "Outros" : current,
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
  this.createAndShowGraph(this.dataTograph);
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

ArrayToGraph.prototype.createAndShowGraph = function (dataVelues) {
  var self = this;
  if (this.array.length > 4) {
    this.anguloX = -30;
  }
  this.chart = new CanvasJS.Chart(this.local, {
    zoomEnabled: true,
    exportEnabled: true,
    theme: "theme2",
    animationEnabled: true,
    title: {
      text: self.titulo,
      fontSize: 30
    },
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
