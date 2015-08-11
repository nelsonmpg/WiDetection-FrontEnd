  window.DetailView = Backbone.View.extend({
      sensor: undefined,
      events: {
          "click a.selectSensor": "selectSensor",
          "change #SensorSelect": "setsensor"
      },
      initialize: function () {
          //this.render();
      },
      dataselect: function (start, end) {
          $('#reportrange span').html(start.format("dddd, MMMM Do YYYY") + ' - ' + end.format("dddd, MMMM Do YYYY"));
      },
      init: function () {
          //alert("DetailView Inicializada");
          var self = this;

          this.getSensors();
          
          this.dataselect(moment().subtract(29, 'days'), moment());

          $('#reportrange').daterangepicker({
              ranges: {
                  'Today': [moment().subtract(1, 'days'), moment()],
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

          $("#div.daterangepicker.dropdown-menu.opensleft > div.ranges > li:nth-child(1)").click();

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
                      $("#SensorSelect").append("<option data-log='" + data[i].longitude + "' data-lat='" + data[i].latitude + "' data-city='" + data[i].local + "' data-date='" + data[i].data + "' >" + data[i].nomeAntena + "</option>");
                  }
                  self.setsensor();
              },
              function (xhr, ajaxOptions, thrownError) {
                  var json = JSON.parse(xhr.responseText);
                  error_launch(json.message);
              }, {}
          );
      },
      setsensor: function () {
          this.sensor = $('#SensorSelect').find(":selected").text();
          var map = carregarmapa([[$('#SensorSelect').find(":selected").data("city"),
                  $('#SensorSelect').find(":selected").data("lat"),
                  $('#SensorSelect').find(":selected").data("log"),
                  $('#SensorSelect').find(":selected").data("date")]],
              $("#mapSensor")[0]);
         
          addCircletoMap(map, [{lat: $('#SensorSelect').find(":selected").data("lat"), log: $('#SensorSelect').find(":selected").data("log"),
                  value: 1
              }]);

          $("#tblSensor").html('<tr><th style="width:50%">Latitude:</th><td>' + $('#SensorSelect').find(":selected").data("lat") + '</td></tr>' +
              '<tr><th style="width:50%">Longitude:</th><td>' + $('#SensorSelect').find(":selected").data("log") + '</td></tr>' +
              '<tr><th style="width:50%">Last Active:</th><td>' + moment($('#SensorSelect').find(":selected").data("date")).format('DD/MM/YYYY HH:mm') + '</td></tr>');

//          this.tableload();
      },
      tableload: function () {
//          modem("GET",
//              "/getDispMoveisbySensor/" + window.profile.id + "/" + $('#SensorSelect').find(":selected").text(),
//              function (data) {
//                  var dataSet = [];
//                  for (var i in data) {
//                      for (var a in data[i].reduction) {
//                          dataSet.push([data[i].reduction[a].macAddress, data[i].group,
//                              moment(data[i].reduction[a].disp[0].First_time * 1000).format('DD/MM/YYYY HH:mm'),
//                              "<a href='#' title='" + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).format('DD/MM/YYYY HH:mm') + "'> " + moment(data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].Last_time * 1000).fromNow() + "</a>",
//                              (data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID == "(notassociated)") ? "" : data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID
//                          ]);
//                      }
//                  }
//                  if (data.length == 0) {
//                      $('#tblDetailsDevices').append('<div class="overlay text-center" style="margin-top: 40%;"><h1><i class="fa fa-frown-o fa-spin"></i> No Results</h1></div>');
//                  } else {
//                      $('#tblDetailsDevices').DataTable({
//                          "data": dataSet,
//                          "paging": true,
//                          "lengthChange": false,
//                          "searching": false,
//                          "ordering": true,
//                          "info": true,
//                          "autoWidth": true
//                      });
//                  }
//              },
//              function (xhr, ajaxOptions, thrownError) {
//                  var json = JSON.parse(xhr.responseText);
//                  error_launch(json.message);
//              }, {}
//          );
      },
      changedate: function (ev, picker) {
          this.loadcharts(picker.startDate.format(), picker.endDate.format());
      },
      loadcharts: function (min, max) {
          var self = this;
          if (window.profile.id != undefined && self.sensor != undefined) {
              modem("GET",
                  "/getAllOrderbyVendor/" + window.profile.id + "/ap/" + self.sensor + "/" + max + "/" + min,
                  function (data) {
                      var values = [], dataSet = [];
                      ;
                      for (var i in data) {
                          values.push({y: data[i].reduction.length, label: data[i].group});
                          for (var a in data[i].reduction) {
                              dataSet.push([data[i].group,
                                  data[i].reduction[a].ESSID,
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
                          $('#chartAccessPoint').html('<div class="overlay text-center" style="margin-top: 40%;"><h1><i class="fa fa-frown-o fa-spin"></i> No Results</h1></div>');
                      } else {
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
                          var chart = new CanvasJS.Chart("chartAccessPoint",
                              {
                                  animationEnabled: true,
                                  axisX: {
                                      labelAngle: -45,
                                      interval: 1
                                  },
                                  axisY: {
                                      interval: 1
                                  },
                                  legend: {
                                      verticalAlign: "bottom",
                                      horizontalAlign: "center"
                                  },
                                  theme: "theme2",
                                  data: [
                                      {
                                          type: "column",
                                          dataPoints: values
                                      }
                                  ]
                              });

                          chart.render();
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
                                  (data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID == "(notassociated)") ? "" : data[i].reduction[a].disp[0].values[data[i].reduction[a].disp[0].values.length - 1].BSSID
                              ]);
                          }
                      }
                      if (data.length == 0) {
                          $('#chartDispMoveis').html('<div class="overlay text-center" style="margin-top: 40%;"><h1><i class="fa fa-frown-o fa-spin"></i> No Results</h1></div>');
                      } else {

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

                          var chart = new CanvasJS.Chart("chartDispMoveis",
                              {
                                  animationEnabled: true,
                                  axisX: {
                                      labelAngle: -45,
                                      interval: 1
                                  },
                                  axisY: {
                                      interval: 1
                                  },
                                  legend: {
                                      verticalAlign: "bottom",
                                      horizontalAlign: "center"
                                  },
                                  theme: "theme2",
                                  data: [
                                      {
                                          type: "column",
                                          dataPoints: values
                                      }
                                  ]
                              });

                          chart.render();
                      }
                  },
                  function (xhr, ajaxOptions, thrownError) {
                      var json = JSON.parse(xhr.responseText);
                      error_launch(json.message);
                  }, {}
              );

          }
      },
      render: function () {
          $(this.el).html(this.template());
          return this;
      }
  });
