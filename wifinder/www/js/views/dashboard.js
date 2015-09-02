window.DashboardView = Backbone.View.extend({
  socketDashboard: null,
  graph2Bar: undefined,
  chartrealtimeMoveis: null,
  chartrealtimeAp: null,
  chart: undefined,
  countChart: undefined,
  lastSensorselect: "",
  events: {
    "change #select-chart-sensor": "selectsensortochart"
  },
  initialize: function (opt) {
    this.socketDashboard = opt.socket;
  },
  init: function () {
    var self = this;

    self.requestNumDisps();
    self.createChart2Bar();
    self.chartDispActive();
    self.createChartTotalVisitas();
    self.MapSensors();
    self.carregarNetwork();

    //Initialize Select2 Elements
    $(".select2").select2();
    $.AdminLTE.boxWidget.activate();
  },
  requestNumDisps: function () {
    var self = this;
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
    var self = this;
    modem("GET",
        "/getAllAntenasAndDisps/" + window.profile.id,
        function (data) {
          var sensorList = "";
          for (var i in data) {
            sensorList += '<option class="select-sensor-lst">' + data[i].AP.nome + '</option>';
          }

          $("#select-chart-sensor").html(sensorList);
          $("#select-chart-sensor > option:first").attr("selected", "selected");
          $("#select-chart-sensor").trigger('change');

          self.graph2Bar = new ArrayToGraph(data, "chart2bars", "column");
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
    var sensor = $('#select-chart-sensor').find(":selected").text();
    if (self.chartrealtimeMoveis != null) {
      self.chartrealtimeMoveis.stopIntervalGraph();
    }
    if (self.chartrealtimeAp != null) {
      self.chartrealtimeAp.stopIntervalGraph();
    }
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
    var self = this;
    modem("GET",
            "/getSensors/" + window.profile.id,
            function (data) {
              var locations = [];
              for (var i in data) {
                locations.push([data[i].nomeAntena, data[i].latitude, data[i].longitude, data[i].data]);
              }
              carregarmapa(locations, "map");
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  chartDispActive: function () {
    var self = this;
    this.socketDashboard.getAllDisp(window.profile.id);
  },
  createChartDispActive: function (data) {
    var self = this;
    self.chart = new ArrayToGraph(data, "chart1LineActives", "line");
    self.chart.createArrayToGraphSimpleLine();
  },
  createChartTotalVisitas: function () {
    var self = this;
    modem("GET",
        "/getAllTimes/" + window.profile.id,
        function (data) {
          console.log(JSON.parse(data));
            self.countChart = new ArrayToGraph(JSON.parse(data), "chartDispVisit", "column");
            self.countChart.createArrayToGraphOneBar2();
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
    self.chart.updateGraphSimpleLine(data);
  },
  carregarNetwork: function () {
    var self = this;
    modem("GET",
        "/getAllAP/" + window.profile.id,
        function (data) {
          var values = [];
          for (var ssid in data[0].group[0]) {
            values[data[0].group[0][ssid]] = {"bssid": data[0].group[0][ssid], "name": data[0].group[1][ssid], "value": data[0].reduction[0][ssid]};
          }

          self.makeNetwork(values);

        },
        function (xhr, ajaxOptions, thrownError) {
          var json = JSON.parse(xhr.responseText);
          error_launch(json.message);
        }, {}
    );
  },
  makeNetwork: function (macs) {
    var self = this;
    var xnodes = [];
    var xedges = [];
    var devices = [];
    for (var a in macs) {
      if (devices.indexOf(macs[a].bssid.trim()) < 0) {
        devices.push(macs[a].bssid.trim());
        xnodes.push({id: devices.indexOf(macs[a].bssid.trim()) + 1, label: macs[a].name + "\n" + macs[a].bssid.trim(), group: "ap"});
      }

      modem("GET",
          "/getDispConnectedtoAp/" + window.profile.id + "/" + macs[a].bssid,
          function (data) {
            for (var i in data[0]) {
              if (devices.indexOf((data[0][i].macAddress).trim()) < 0) {
                devices.push((data[0][i].macAddress).trim());
                xnodes.push({id: devices.indexOf((data[0][i].macAddress).trim()) + 1, label: data[0][i].nameVendor + "\n" + data[0][i].macAddress, group: "device"});
              }
              if (_.where(xedges, {from: devices.indexOf(data[1].trim()) + 1, to: devices.indexOf((data[0][i].macAddress).trim()) + 1}) == 0) {
                xedges.push({from: devices.indexOf(data[1].trim()) + 1, to: devices.indexOf((data[0][i].macAddress).trim()) + 1});
              }
            }
            if (data[1] == macs[a].bssid) { //se for o ultimo ap

              //getDispMacbyVendor

              modem("GET",
                  "/getDispMacbyVendor/" + window.profile.id,
                  function (data) {
                    for (var c in data) {
                      for (var d in data[c].reduction) {
                        if (devices.indexOf((data[c].reduction[d]).trim()) < 0) {
                          devices.push((data[c].reduction[d]).trim());
                          xnodes.push({id: devices.indexOf((data[c].reduction[d]).trim()) + 1, label: data[c].group + "\n" + data[c].reduction[d], group: "device"});
                        }
                      }
                    }

                    self.fazergrafico(xedges, xnodes);
                  },
                  function (xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                  }, {}
              );
            }

          },
          function (xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
          }, {}
      );
    }
  },
  fazergrafico: function (xedges, xnodes) {
    var self = this;
    // xnodes.push({id: 1, label: $('#ApSelect').find(":selected").text(), group: "ap"});

    // create 2 array with edges and nodes
    var edges = new vis.DataSet(xedges);
    var nodes = new vis.DataSet(xnodes);
    // create a network
    var container = document.getElementById('mynetwork');
    // provide the data in the vis format
    var data = {
      nodes: nodes,
      edges: edges
    };
    var options = {
      "edges": {
        "smooth": {
          "roundness": 0
        }
      },
      groups: {
        ap: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf1eb',
            size: 50,
            color: '#00ff00'
          }
        },
        device: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf108',
            size: 50,
            color: '#eeeeee'
          }
        }
      }
    };
    if (this.net != undefined) {
      this.net.destroy();
      this.net = null;
    }
    // initialize your network!
    self.net = new vis.Network(container, data, options);
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
