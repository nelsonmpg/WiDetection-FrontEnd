window.DashboardView = Backbone.View.extend({
  loading: '<div class="overlay">' +
          '<i class="fa fa-refresh fa-spin"></i>' +
          '</div>',
  socketDashboard: null,
  graph2Bar: undefined,
  chart: undefined,
  events: {
  },
  initialize: function (opt) {
    this.socketDashboard = opt.socket;
  },
  init: function () {
    var self = this;
    $("body").find("#chart2bars").html(self.loading);
    $("body").find("#chart1LineActives").html(self.loading);
    $("body").find("#chartDispVisit").html(self.loading);

    self.requestBumDisps();
    self.createChart2Bas();
    self.createChartDispActive();
    self.createChartTotalVisitas();

    $.AdminLTE.boxWidget.activate();
  },
  requestBumDisps: function () {
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
  createChart2Bas: function () {
    modem("GET",
            "/getAllAntenasAndDisps/" + window.profile.id,
            function (data) {
              self.graph2Bar = new ArrayToGraph(data, "Quantidade de Dispositivos / Sensor", "", "chart2bars", "column");
              // para aparecer a div com os resultados
              self.graph2Bar.createArrayToGraphTwoBar();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  createChartDispActive: function () {
    modem("GET",
            "/getAllDisp/" + window.profile.id,
            function (data) {
              for (var i in data) {
                data[i].x = new Date(data[i].x);
              }
              result = data;
              self.chart = new CanvasJS.Chart("chart1LineActives", {
                theme: "theme2",
//        title: {
//          text: "Dispositivos Ativos"
//        },
                animationEnabled: true,
                axisX: {
                  valueFormatString: "HH:mm"
                },
                axisY: {includeZero: false},
                data: [{
                    type: "line",
                    lineThickness: 3,
                    dataPoints: result
                  }]
              });
              self.chart.render();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  createChartTotalVisitas: function () {
    modem("GET",
            "/getAllTimes/" + window.profile.id,
            function (data) {
              var arrayToChart = [];
              for (var i in data) {
                arrayToChart.push({label: i, y: data[i].length * 1});
              }
              console.log(arrayToChart);
              var options = {
//		title: {
//			text: "Column Chart using jQuery Plugin"
//		},
                animationEnabled: true,
                data: [{
                    type: "bar", //change it to line, area, bar, pie, etc
                    click: function (e) { //no click mostrar o fabricante do dispositivo
                      $.ajax({
                        type: "GET",
                        url: "/getNameVendor/" + e.dataPoint.label + "/" + socket.id,
                        dataType: 'json',
                        success: function (data) {
                          alert(data);
                        },
                        error: function (error) {
                          console.log(JSON.stringify(error));
                        }
                      });
                      ;
                    },
                    dataPoints: arrayToChart
                  }
                ]
              };
              var countChart = new CanvasJS.Chart("chartDispVisit", options);
              countChart.render();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  updatedisp: function (data, disp) {
    var self = this;
    switch (disp) {
      case "ap":
        if (self.graph2Bar) {
          self.graph2Bar.updateNumAp(data);
        }
        break;
      case "disp":
        if (self.graph2Bar) {
          self.graph2Bar.updateNumDisp(data);
        }
        break;
    }
  },
  newdisps: function (data, local) {
    var self = this;
    switch (local) {
      case "moveis":
        $("body").find("#disp-num-div").html((($("body").find("#disp-num-div").text() * 1) + 1));
        break;
      case "ap":
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
