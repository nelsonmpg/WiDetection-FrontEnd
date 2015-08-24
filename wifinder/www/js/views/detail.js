/* global moment */

window.DetailView = Backbone.View.extend({
  sensor: undefined,
  events: {
    "click a.selectSensor": "selectSensor",
    "change #SensorSelect": "setsensor",
    "click .APjump": "openDetailAp",
    "click .select-source": "selectSource"
  },
  initialize: function () {
    //this.render();
  },
  dataselect: function (start, end) {
    $('#reportrange span').html(start.format("dddd, MMMM Do YYYY") + ' - ' + end.format("dddd, MMMM Do YYYY"));
  },
  openDetailAp: function (e) {
    e.preventDefault();
    e.stopPropagation();
    app.navigate("DetailAP", {
      mac: $(e.currentTarget).text(),
      trigger: true
    });
  },
  init: function () {
    //alert("DetailView Inicializada");
    var self = this;
    this.getSensors();
    this.dataselect(moment().subtract(29, 'days'), moment());
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
    $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
      self.changedate(ev, picker);
    });
    $("#reportrange").click();
    setTimeout(function () {
      if (true) {
        $("body > div.daterangepicker.dropdown-menu.opensleft > div.ranges > ul > li:nth-child(5)").click();
//                $("body > div.daterangepicker.dropdown-menu.opensleft > div.ranges > div > button.applyBtn.btn.btn-sm.btn-success").click();
      }
    }, 150);
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
  selectSensor: function (e) {
    e.preventDefault();
    e.stopPropagation();
  },
  getSensors: function (e) {
    var self = this;
    modem("GET",
            "/getSensors/" + window.profile.id,
            function (data) {
              for (var i in data) {
                $("#SensorSelect").append("<option data-log='" + data[i].longitude +
                        "' data-lat='" + data[i].latitude +
                        "' data-city='" + data[i].local +
                        "' data-date='" + data[i].data +
                        "' data-posx='" + data[i].posX +
                        "' data-posy='" + data[i].posY +
                        "' >" + data[i].nomeAntena + "</option>");
              }
              $("#SensorSelectt > option:first").attr("selected", "selected");
              $("#SensorSelect").trigger('change');
              self.setsensor();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  setsensor: function () {
    var self = this;
    $('#chartCpu').val(0).trigger('change');
    $('#chartMem').val(0).trigger('change');
    $('#chartDisc').val(0).trigger('change');

    this.sensor = $('#SensorSelect').find(":selected").text();
    var map = carregarmapa([[$('#SensorSelect').find(":selected").data("city"),
        $('#SensorSelect').find(":selected").data("lat"),
        $('#SensorSelect').find(":selected").data("log"),
        $('#SensorSelect').find(":selected").data("date")]],
            $("#mapSensor")[0]);
    addCircletoMap(map, [{lat: $('#SensorSelect').find(":selected").data("lat"), log: $('#SensorSelect').find(":selected").data("log"),
        value: 1
      }]);
    
    $("#tblSensor").html(
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
            '<tr><th style="width:50%">Last Active:</th><td>' +
            moment($('#SensorSelect').find(":selected").data("date")).format('DD/MM/YYYY HH:mm') + '</td></tr>');

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
                  left: $('#SensorSelect').find(":selected").data("posx"),
                  top: $('#SensorSelect').find(":selected").data("posy")
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
    this.loadcharts(picker.startDate.format(), picker.endDate.format());
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
                  for (var a in data[i].reduction) {
                    dataSet.push([data[i].group,
                      "<a href='#' class='APjump' data-mac='" + data[i].reduction[a].ESSID + "'>" + data[i].reduction[a].ESSID + "</a>",
                      data[i].reduction[a].Authentication,
                      data[i].reduction[a].Cipher,
                      data[i].reduction[a].Privacy,
                      data[i].reduction[a].Speed,
                      data[i].reduction[a].channel,
                      moment(data[i].reduction[a].disp[0].First_time * 1000).format('DD/MM/YYYY HH:mm'),
                      "<a href='#' title='" + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).format('DD/MM/YYYY HH:mm') + "'> " + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).fromNow() + "</a>"
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
                    "searching": false,
                    "ordering": true,
                    "info": true,
                    "autoWidth": true,
                    "destroy": true
                  });
                }
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
                var values = [], dataSet = [];
                for (var i in data) {
                  values.push({y: data[i].reduction.length, label: data[i].group});
                  for (var a in data[i].reduction) {
                    dataSet.push([data[i].reduction[a].macAddress, data[i].group,
                      moment(data[i].reduction[a].disp[0].First_time * 1000).format('DD/MM/YYYY HH:mm'),
                      "<a href='#' title='" + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).format('DD/MM/YYYY HH:mm') + "'> " + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).fromNow() + "</a>",
                      (data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID.trim() == "(notassociated)") ? "" : "<a href='#' class='APjump' data-mac='" + data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID.trim() + "'>" + data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID.trim() + "</a>"
                    ]);
                  }
                }
                if (data.length == 0) {
                  self.toggleContentors(false);
                } else {

                  var chartdisp = new ArrayToGraph(data, "chartDispMoveis", "column");
                  chartdisp.createArrayToGraphOneBar();

                  self.toggleContentors(true);
                  $('#tblDetailsDevices').DataTable({
                    "data": dataSet,
                    "paging": true,
                    "lengthChange": false,
                    "searching": false,
                    "ordering": true,
                    "info": true,
                    "autoWidth": true,
                    "destroy": true
                  });
                }
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
      $('#chartCpu').val(data.cpu).trigger('change');
      $('#chartMem').val((data.memory.used / data.memory.total) * 100).trigger('change');
      $('#chartDisc').val(data.disc.use.toString().replace(/%/g, "")).trigger('change');
    }
  },
  selectSource: function (e) {
    var self = this;
    e.preventDefault();
    $(".tab-pane").removeClass("active");
    $("." + $(e.currentTarget).children().attr("href")).addClass("active");
  },
  render: function () {
    $(this.el).html(this.template());
    return this;
  }
});
