
/* global moment */

var ChartRealTime = function (arrayValues, sensor, localChart) {
  this.arrayValues = arrayValues;
  this.sensor = sensor;
  this.loaclChart = localChart;
  this.dataLength = 60;
  this.updateInterval = 1000;
  this.timeRemove = 5;
  this.arrayvalues = [];
  this.valuesToGraph = [];
  this.listaHostsStartAndUpdateValues = [];
  this.showNewGraph = false;
  this.lastSizeListArray = 1;
  this.updateInterGraph = null;
  this.oneGraph = false;
  this.chart = null;
  this.atualSite = window.profile.get("site");

  this.createAndUpdateListaHostAndValues(this.arrayValues);
};

ChartRealTime.prototype.createAndUpdateListaHostAndValues = function (lista) {
  for (var i in lista) {
    if (!this.checkDdiffDates(lista[i].data)) {
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

ChartRealTime.prototype.updateGraph = function () {
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

ChartRealTime.prototype.updatePowerChart = function (values) {
  if (values.sensor.trim() == this.sensor) {
    this.createAndUpdateListaHostAndValues(values.hosts);
  }
};

ChartRealTime.prototype.createUpdateScaleGraph = function () {
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
    this.graph();
    this.showNewGraph = false;
    this.updateIntervalGraph();
  } else {
    this.graph();
  }
};

ChartRealTime.prototype.stopIntervalGraph = function () {
  clearInterval(this.updateInterGraph);
};

ChartRealTime.prototype.updateIntervalGraph = function () {
  var self = this;
  this.updateInterGraph = setInterval(function () {
    if (Backbone.history.getFragment() != "Dashboard" ||
            self.atualSite != window.profile.get("site")) {
      self.stopIntervalGraph();
    }
    self.updateGraph();
    self.chart.render();
  }, self.updateInterval);
};

ChartRealTime.prototype.graph = function () {
  var self = this;
  this.chart = new CanvasJS.Chart(this.loaclChart, {
    zoomEnabled: true,
    exportEnabled: true,
    animationEnabled: true,
    theme: "theme3",
    toolTip: {
      shared: true
    },
    axisY: {
      gridThickness: 0.2,
      labelFontSize: 12,
      suffix: " dBm",
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    axisX: {
      valueFormatString: "H:mm:ss",
      interval: 10,
      labelFontSize: 12,
      labelFontFamily: "verdana",
      labelFontColor: "black"
    },
    data: this.valuesToGraph
  });
  this.chart.render();
};

ChartRealTime.prototype.inicializaArray = function () {
  var d = new Date().getTime();
  var newTime = d - (this.dataLength * 1000);
  var vals = [];
  for (var i = 0; i < this.dataLength; i++) {
    vals.push({
      x: new Date(newTime + (i * 1000)),
      y: null
    });
  }
  return vals;
};

ChartRealTime.prototype.countHosts = function (list) {
  var a = 0;
  for (var i in list) {
    a++;
  }
  return a;
};

ChartRealTime.prototype.checkDdiffDates = function (last_date) {
  var diff = moment(new Date().getTime()).diff(last_date * 1000);

  var diffSeconds = diff / 1000;
  var HH = Math.floor(diffSeconds / 3600);
  var MM = Math.floor(diffSeconds % 3600) / 60;

  return ((HH > 0) ? true : (MM > this.timeRemove) ? true : false);
};