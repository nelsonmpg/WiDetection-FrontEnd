window.DashboardView = Backbone.View.extend({
  socketDashboard: null,
  graph2Bar: undefined,
  chart: undefined,
  interval_chart: null,
  countChart: undefined,
  lastSensorselect: "",
  chartrealtimeMoveis: null,
  chartrealtimeAp: null,
  self: this,
  events: {
    "click #teste": "testeMap",
    "click .select-sensor-lst": "selectsensortochart"
  },
  initialize: function (opt) {
    this.socketDashboard = opt.socket;
  },
  init: function () {
    var self = this;
    $('.selectpicker').selectpicker();

    self.requestNumDisps();
    self.createChart2Bar();
    self.chartDispActive();
    self.createChartTotalVisitas();
    self.MapSensors();

    $.AdminLTE.boxWidget.activate();
  },
  requestNumDisps: function () {
    modem("GET",
            "/getNumDispositivos/" + window.profile.id,
            function (data) {
              $("body").find("#sensores-num-div").html(data.sensor);
              $("body").find("#disp-num-div").html(data.moveis);
              $("body").find("#ap-num-div").html(data.ap);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  createChart2Bar: function () {
    self = this;
    modem("GET",
            "/getAllAntenasAndDisps/" + window.profile.id,
            function (data) {
              var sensorList = "";
              for (var i in data) {
                sensorList += '<option class="select-sensor-lst">' + data[i].AP.nome + '</option>';
              }
              $("#select-chart-sensor > select").html(sensorList).selectpicker('refresh');
              $("#select-chart-sensor div.dropdown-menu ul.dropdown-menu li.selected a").trigger('click');
              self.graph2Bar = new ArrayToGraph(data, "", "", "chart2bars", "column");
              // para aparecer a div com os resultados
              self.graph2Bar.createArrayToGraphTwoBar();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  selectsensortochart: function (e) {
    var self = this;
    var sensor = $(e.currentTarget).text();
    if (self.lastSensorselect != sensor) {
      self.lastSensorselect = sensor;
      modem("GET",
              "/getpowerlistdisps/" + window.profile.id + "/" + sensor + "/disp",
              function (data) {
                self.chartrealtimeMoveis = new ChartRealTime(data, sensor, "chartdisp");
                self.chartrealtimeMoveis.updateIntervalGraph();
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {}
      );
      modem("GET",
              "/getpowerlistdisps/" + window.profile.id + "/" + sensor + "/ap",
              function (data) {
                self.chartrealtimeAp = new ChartRealTime(data, sensor, "chartap");
                self.chartrealtimeAp.updateIntervalGraph();
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {}
      );
    }
  },
  MapSensors: function (e) {
    modem("GET",
            "/getSensors/" + window.profile.id,
            function (data) {
              var locations = [];
              for (var i in data) {
                locations.push([data[i].nomeAntena, data[i].latitude, data[i].longitude, data[i].data])
              }
              carregarmapa(locations, $("#map")[0]);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  chartDispActive: function () {
    self = this;
    this.socketDashboard.getAllDisp(window.profile.id);
  },
  createChartDispActive: function (data) {
    for (var i in data) {
      data[i].x = new Date(data[i].x);
    }
    result = data;
    self.chart = new CanvasJS.Chart("chart1LineActives", {
      theme: "theme2",
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
        interval: 1,
        labelFontSize: 12,
        labelFontFamily: "verdana",
        labelFontColor: "black"
      },
      data: [{
          type: "line",
          lineThickness: 3,
          dataPoints: result
        }]
    });
    self.chart.render();
  },
  createChartTotalVisitas: function () {
    self = this;
    modem("GET",
            "/getAllTimes/" + window.profile.id,
            function (data) {
              var arrayToChart = [];
              for (var i in data) {
                arrayToChart.push({label: i, y: data[i].length * 1});
              }
              var options = {
                animationEnabled: true,
                axisY: {
                  gridThickness: 1,
                  interval: 1,
                  labelFontSize: 12,
                  labelFontFamily: "verdana",
                  labelFontColor: "black"
                },
                axisX: {
                  interval: 1,
                  labelAngle: -70,
                  labelFontSize: 12,
                  labelFontFamily: "verdana",
                  labelFontColor: "black"
                },
                data: [{
                    type: "column", //change it to line, area, bar, pie, etc
                    dataPoints: arrayToChart
                  }
                ]
              };
              self.countChart = new CanvasJS.Chart("chartDispVisit", options);
              self.countChart.render();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  updatePower: function (data, disp) {
    var self = this;
    switch (disp) {
      case "ap":
        if (self.chartrealtimeAp) {
          self.chartrealtimeAp.updatePowerChart(data);
        }
        break;
      case "disp":
        if (self.chartrealtimeMoveis) {
          self.chartrealtimeMoveis.updatePowerChart(data);
        }
        break;
    }
  },
  newdisps: function (data, local) {
    var self = this;
    switch (local) {
      case "moveis":
        if (self.graph2Bar) {
          self.graph2Bar.updateNumDisp(data);
        }
        $("body").find("#disp-num-div").html((($("body").find("#disp-num-div").text() * 1) + 1));
        break;
      case "ap":
        if (self.graph2Bar) {
          self.graph2Bar.updateNumAp(data);
        }
        $("body").find("#ap-num-div").html((($("body").find("#ap-num-div").text() * 1) + 1));
        break;
      case "sensor":
        $("body").find("#sensores-num-div").html((($("body").find("#sensores-num-div").text() * 1) + 1));
        if (self.graph2Bar) {
          self.graph2Bar.updateSensor(data);
        }
        break;
    }
  },
  updateChart: function (data) {
    var self = this;
    data.x = new Date(data.x);
    data.y = data.y * 1;
    self.chart.options.data[0].dataPoints.push(data);
    self.chart.options.data[0].dataPoints.shift();
    self.chart.render();
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
