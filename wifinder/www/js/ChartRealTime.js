
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

  this.createlistvalues();
};

ChartRealTime.prototype.createlistvalues = function () {
  var self = this;
  for (var i in self.arrayValues) {
    var valuesArray = [];// self.inicializaArray();
    for (var j in self.arrayValues[i][0].values) {
      valuesArray.push({
        x: new Date(self.arrayValues[i][0].values[j].Last_time),
        y: 1 * self.arrayValues[i][0].values[j].Power
      });
      if (valuesArray.length > this.dataLength) {
        valuesArray.shift();
      }
    }
    this.arrayvalues[self.arrayValues[i][0].macAddress] = {
      "firstTime": self.arrayValues[i][0].First_time,
      "macAddress": self.arrayValues[i][0].macAddress,
      "nameSensor": self.arrayValues[i][0].name,
      "nameVendor": self.arrayValues[i][0].nameVendor,
      "values": valuesArray
    };
  }
  self.createListValuesToChart();
};

ChartRealTime.prototype.createListValuesToChart = function () {
  var self = this;
  for (var i in this.arrayvalues) {
    var val = {
      type: "line",
      xValueType: "dateTime",
      lineThickness: 3,
      name: i,
//      click: function (e) {
//        self.oneGraph = true;
//        self.showNewGraph = true;
//        self.graphSelect = e.dataSeries.name;
//      },
      dataPoints: this.arrayvalues[i].values
    };
    this.valuesToGraph.push(val);
  }
  self.graph();
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
    data: this.valuesToGraph //,
//    legend: {
//      horizontalAlign: "right", // left, center ,right 
//      verticalAlign: "center", // top, center, bottom,
//      fontSize: 14,
//      fontWeight: "bold",
//      fontFamily: "calibri",
//      fontColor: "dimGrey",
//      cursor: "pointer",
//      itemclick: function (e) {
//        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
//          e.dataSeries.visible = false;
//        } else {
//          e.dataSeries.visible = true;
//        }
//        self.chart.render();
//      }
//    }
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
      y: 0
    });
  }
  return vals;
};

ChartRealTime.prototype.checkDdiffDates = function (last_date) {
  var diff = moment(new Date().getTime()).diff(last_date * 1000);

  var diffSeconds = diff / 1000;
  var HH = Math.floor(diffSeconds / 3600);
  var MM = Math.floor(diffSeconds % 3600) / 60;

  return ((HH > 0) ? true : (MM > this.timeRemove) ? true : false);
};