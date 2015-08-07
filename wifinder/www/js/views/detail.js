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

          this.getSensors();
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
          carregarmapa([[$('#SensorSelect').find(":selected").data("city"),
                  $('#SensorSelect').find(":selected").data("lat"),
                  $('#SensorSelect').find(":selected").data("log"),
                  $('#SensorSelect').find(":selected").data("date")]],
              $("#mapSensor")[0]);
      },
      changedate: function (ev, picker) {
          console.log(picker.startDate.format());
          console.log(picker.endDate.format());

          
          this.loadcharts(moment(picker.startDate, moment.ISO_8601),
              moment(picker.endDate, moment.ISO_8601));
      },
      loadcharts: function (min, max) {
          var self = this;
          console.log(window.profile.id, min, max);
          if (window.profile.id != undefined && self.sensor != undefined) {
              modem("GET",
                  "/getAllOrderbyVendor/" + window.profile.id + "/ap/" + self.sensor + "/" + max + "/" + min,
                  function (data) {
                      var values = [];
                      for (var i in data) {
                          values.push({y:data[i].reduction.length,label:data[i].group});
                      }

                      var chart = new CanvasJS.Chart("mapAccessPoint",
                          {
                              animationEnabled: true,
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
