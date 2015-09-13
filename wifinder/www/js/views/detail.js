/* global moment, app */

window.DetailView = Backbone.View.extend({
  loadingState: '<div class="overlay text-center"><i class="fa fa-refresh fa-spin"></i></div>',
  testeRemoveBlock: [],
  lenghtRemoveBlock: 3,
  testeRemoveBlocksensor: [],
  lenghtRemoveBlockSelSensor: 2,
  startBlock: true,
  sensor: undefined,
  allap: [],
  events: {
    "click a.selectSensor": function (e) {
      e.preventDefault();
    },
    "change #SensorSelect": "setsensor",
    "click .APjump": "openDetailAp",
    "click .Dispjump": "openDetailDisp",
    "click .select-source": "selectSource",
    "apply.daterangepicker #reportrange": function (ev, picker) {
      var self = this;
      $("#modalWait").show();
      $("#chartDispMoveis").html(self.loadingState);
      $("#chartAccessPoint").html(self.loadingState);
      this.changedate(ev, picker);
    }
  },
  initialize: function () {
  },
  dataselect: function (start, end) {
    $('#reportrange span').html(start.format("dddd, MMMM Do YYYY") + ' - ' + end.format("dddd, MMMM Do YYYY"));
  },
  openDetailAp: function (e) {
    e.preventDefault();
    e.stopPropagation();
    window.profile.set("nav-mac", $(e.currentTarget).data("mac"));
    app.navigate("DetailAP", {
      trigger: true
    });
  },
  openDetailDisp: function (e) {
    e.preventDefault();
    e.stopPropagation();
    window.profile.set("nav-vendor", $(e.currentTarget).data("vendor"));
    window.profile.set("nav-mac", $(e.currentTarget).text());
    app.navigate("DetailDevice", {
      trigger: true
    });
  },
  init: function (sensrorsel) {
    var self = this;
    this.sensor = sensrorsel;
    $("#modalWait").show();
    self.startBlock = true;
    this.getAllAP();
    this.getSensors();
    this.dataselect(moment(), moment());
    $('#reportrange').daterangepicker({
      ranges: {
        'Today': [moment().hours(0).minutes(0).seconds(0), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    }, self.dataselect);
    $(".knob").knob({
      "min": 0,
      "max": 100,
      'format': function (value) {
        return value + '%';
      },
      change: function (value) {
//        console.log("change : " + value);
      },
      draw: function () {
// "tron" case
        if (this.$.data('skin') == 'tron') {

          var a = this.angle(this.cv)  // Angle
                  , sa = this.startAngle          // Previous start angle
                  , sat = this.startAngle         // Start angle
                  , ea                            // Previous end angle
                  , eat = sat + a                 // End angle
                  , r = true;
          this.g.lineWidth = this.lineWidth;
          this.o.cursor
                  && (sat = eat - 0.3)
                  && (eat = eat + 0.3);
          if (this.o.displayPrevious) {
            ea = this.startAngle + this.angle(this.value);
            this.o.cursor
                    && (sa = ea - 0.3)
                    && (ea = ea + 0.3);
            this.g.beginPath();
            this.g.strokeStyle = this.previousColor;
            this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
            this.g.stroke();
          }

          this.g.beginPath();
          this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
          this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
          this.g.stroke();
          this.g.lineWidth = 2;
          this.g.beginPath();
          this.g.strokeStyle = this.o.fgColor;
          this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
          this.g.stroke();
          return false;
        }
      }
    });

//Initialize Select2 Elements
    $(".select2").select2();
    $.AdminLTE.boxWidget.activate();
  },
  getAllAP: function () {
    self = this;
    modem("GET",
            "/getAllAP/" + window.profile.id,
            function (data) {
              var values = [];
              for (var ssid in data[0].group[0]) {
                values[data[0].group[0][ssid]] = {
                  "bssid": data[0].group[0][ssid],
                  "name": data[0].group[1][ssid],
                  "value": data[0].reduction[0][ssid]
                };
              }
              self.allap = values;
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
    this.allap = self.allap;
  },
  getSensors: function (e) {
    var self = this;
    modem("GET",
            "/getSensors/" + window.profile.id,
            function (data) {
              for (var i in data) {
                $("#SensorSelect").append(
                        "<option data-log='" + data[i].data.longitude +
                        "' data-lat='" + data[i].data.latitude +
                        "' data-city='" + data[i].data.local +
                        "' data-date='" + data[i].data.data +
                        "' data-posx='" + data[i].data.posX +
                        "' data-posy='" + data[i].data.posY +
                        "' >" + data[i].data.nomeAntena + "</option>");
              }

              if (self.sensor) {
                $("#SensorSelect > option:contains('" + self.sensor + "')").attr("selected", "selected");
              } else {
                $("#SensorSelectt > option:first").attr("selected", "selected");
              }
              $("#SensorSelect").trigger('change');

              // add active class a primeira opcao do seletor de data range
              $(".daterangepicker .ranges ul li:first").addClass("active");
              self.testeRemoveBlock.push(true);
              self.removeBlock();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  setsensor: function () {
    var self = this;
    $("#modalWait").show();
    $("#chartDispMoveis").html(self.loadingState);
    $("#chartAccessPoint").html(self.loadingState);
    $('#chartCpu').val(0).trigger('change');
    $('#chartMem').val(0).trigger('change');
    $('#chartDisc').val(0).trigger('change');

    this.sensor = $('#SensorSelect').find(":selected").text();
    var map = carregarmapa([[
        $('#SensorSelect').find(":selected").data("city"),
        $('#SensorSelect').find(":selected").data("lat"),
        $('#SensorSelect').find(":selected").data("log"),
        $('#SensorSelect').find(":selected").data("date")]],
            "mapSensor");
    addCircletoMap(map, [{
        lat: $('#SensorSelect').find(":selected").data("lat"),
        log: $('#SensorSelect').find(":selected").data("log"),
        value: 1
      }]);

    $("#tblSensor").html(
            '<tr><th style="width:50%">Sensor Name:</th><td>' +
            $('#SensorSelect').find(":selected").text() +
            '</td></tr>' +
            '<tr><th style="width:50%">Latitude:</th><td>' +
            $('#SensorSelect').find(":selected").data("lat") +
            '</td></tr>' +
            '<tr><th style="width:50%">Longitude:</th><td>' +
            $('#SensorSelect').find(":selected").data("log") +
            '</td></tr>' +
            '<tr><th style="width:50%">PosX:</th><td>' +
            $('#SensorSelect').find(":selected").data("posx") +
            '</td></tr>' +
            '<tr><th style="width:50%">PosY:</th><td>' +
            $('#SensorSelect').find(":selected").data("posy") +
            '</td></tr>' +
            '<tr><th style="width:50%">Last Active:</th><td id="actual-time-sensor">' +
            moment($('#SensorSelect').find(":selected").data("date")).format('YYYY/MM/DD HH:mm:ss') + '</td></tr>');

    $(".applyBtn").attr("disabled", false).click();

    $(".sensor-selected").text(this.sensor);
    $(".time-selected").html($(".daterangepicker .ranges ul li:first").text() + " <i class='fa fa-arrow-circle-right'></i> " + $("#reportrange span").text());

    modem("GET",
            "/getPlantSite/" + window.profile.id + "/" + self.sensor,
            function (data) {
              var img = atob(data);
              if (img != "none") {
                $('#plantlocalsensor').css({
                  'border': "2px solid black",
                  "-webkit-box-shadow": "none",
                  "-moz-box-shadow": "none",
                  "box-shadow": "none",
                  "background-image": img,
                  "background-size": "100% 100%",
                  "background-repeat": "no-repeat",
                  "background-position": "center center"
                });
                $("#imgsensor").css({
                  display: "block",
                  left: $('#SensorSelect').find(":selected").data("posx") + "%",
                  top: $('#SensorSelect').find(":selected").data("posy") + "%"
                });
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  changedate: function (ev, picker) {
    $(".daterangepicker .ranges ul li").removeClass("active");
    $(".daterangepicker .ranges ul li:contains('" + picker.chosenLabel + "')").addClass("active");
    this.loadcharts(picker.startDate.format(), picker.endDate.format());

    $(".sensor-selected").text(this.sensor);
    $(".time-selected").html(picker.chosenLabel + " <i class='fa fa-arrow-circle-right'></i> " + $("#reportrange span").text());
  },
  loadcharts: function (min, max) {
    var self = this;
    $("#div-loading").show();
    if (window.profile.id != undefined && self.sensor != undefined) {
      modem("GET",
              "/getAllOrderbyVendor/" + window.profile.id + "/ap/" + self.sensor + "/" + max + "/" + min,
              function (data) {
                var dataSet = [];
                for (var i in data) {
                  for (var a in data[i].reduction) { //anda nos elementos
                    dataSet.push([
                      data[i].group,
                      "<a href='#' class='APjump' data-toggle='tooltip' title=" + data[i].reduction[a].macAddress + " data-mac='" + data[i].reduction[a].macAddress + "'>" + data[i].reduction[a].ESSID + "</a>",
                      data[i].reduction[a].Authentication,
                      data[i].reduction[a].Cipher,
                      data[i].reduction[a].Privacy,
                      data[i].reduction[a].Speed,
                      data[i].reduction[a].channel,
                      moment(data[i].reduction[a].disp[0].First_time * 1000).format('YYYY/MM/DD HH:mm'),
                      "<span data-toggle='tooltip' title='" + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).format('YYYY/MM/DD HH:mm') + "'> " + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).fromNow() + "</span>"
                    ]);
                  }
                }
                if (data.length == 0) {
                  self.toggleContentors(false);
                } else {
                  var chartap = new ArrayToGraph(data, "chartAccessPoint", "column");
                  chartap.createArrayToGraphOneBar();

                  self.toggleContentors(true);
                  $('#tblDetailsAp').DataTable({
                    "data": dataSet,
                    "paging": true,
                    "lengthChange": false,
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    "autoWidth": true,
                    "destroy": true
                  });
                }
                self.testeRemoveBlocksensor.push(true);
                self.testeRemoveBlock.push(true);
                self.removeBlock();
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {}
      );
//grafico disp moveis
      modem("GET",
              "/getAllOrderbyVendor/" + window.profile.id + "/disp/" + self.sensor + "/" + max + "/" + min,
              function (data) {
                var dataSet = [];
                for (var i in data) {
                  for (var a in data[i].reduction) {
                    var ipap = data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID.trim();
                    dataSet.push([
                      "<a href='#' data-vendor='" + data[i].group + "' class='Dispjump'>" + data[i].reduction[a].macAddress + "</a>",
                      data[i].group,
                      moment(data[i].reduction[a].disp[0].First_time * 1000).format('YYYY/MM/DD HH:mm'),
                      "<span data-toggle='tooltip' title='" + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).format('YYYY/MM/DD HH:mm') + "'> " + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).fromNow() + "</span>",
                      (ipap == "(notassociated)") ? "" : "<a href='#' data-mac='" + ipap + "' data-toggle='tooltip' title='" + (typeof self.allap[ipap] == "undefined" ? "Unknown" : self.allap[ipap].name) + "' class='APjump'>" + data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID.trim() + "</a>"
                    ]);
                  }
                }
                if (data.length == 0) {
                  self.toggleContentors(false);
                } else {
                  self.toggleContentors(true);
                  var chartdisp = new ArrayToGraph(data, "chartDispMoveis", "column");
                  chartdisp.createArrayToGraphOneBar();
                  $('#tblDetailsDevices').DataTable({
                    "data": dataSet,
                    "paging": true,
                    "lengthChange": false,
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    "autoWidth": true,
                    "destroy": true
                  });
                }
                self.testeRemoveBlocksensor.push(true);
                self.testeRemoveBlock.push(true);
                self.removeBlock();
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {}
      );
    }
  },
  toggleContentors: function (show) {
    if (show) {
      $("#div-loading").hide();
      $("#div-no-result").hide();
      $("#div-row-table-devices").show();
      $("#div-row-table-ap").show();
      $("#div-charts-details").show();
    } else {
      $("#div-no-result").show();
      $("#div-loading").hide();
      $("#div-row-table-devices").hide();
      $("#div-row-table-ap").hide();
      $("#div-charts-details").hide();
    }
  },
  updateDataSensor: function (data) {
    if (data.nomeAntena == this.sensor) {
      $("#actual-time-sensor").text(moment(data.data).format('YYYY/MM/DD HH:mm:ss'));
      $('#chartCpu').val(data.cpu).trigger('change');
      $('#chartMem').val((data.memory.used / data.memory.total) * 100).trigger('change');
      $('#chartDisc').val(data.disc.use.toString().replace(/%/g, "")).trigger('change');
    }
  },
  selectSource: function (e) {
    var self = this;
    e.preventDefault();
    $("#posiSensor .tab-pane").removeClass("active");
    $("#posiSensor ." + $(e.currentTarget).children().attr("href")).addClass("active");
  },
  removeBlock: function () {
    var self = this;
    if (self.testeRemoveBlock.length >= self.lenghtRemoveBlock && self.startBlock) {
      $("#modalWait").hide();
      self.testeRemoveBlock = [];
      self.testeRemoveBlocksensor = [];
      self.startBlock = false;
    }
    if (self.testeRemoveBlocksensor.length >= self.lenghtRemoveBlockSelSensor && !self.startBlock) {
      $("#modalWait").hide();
      self.testeRemoveBlock = [];
      self.testeRemoveBlocksensor = [];
    }
  },
  render: function () {
    $(this.el).html(this.template());
    return this;
  }
});
