window.DetailView = Backbone.View.extend({
  events: {
    "click a.selectSensor": "selectSensor",
    "change #SensorSelect": "setsensor"
  },
  initialize: function () {
    //this.render();
  },
  dataselect: function (start, end) {
    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
  },
  init: function () {
    //alert("DetailView Inicializada");
    var self = this;
    this.dataselect(moment().subtract(29, 'days'), moment());

    $('#reportrange').daterangepicker({
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    }, self.dataselect);
    this.getSensors();
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
                $("#SensorSelect").append("<option data-log='" + data[i].longitude + "' data-lat='" + data[i].latitude + "' data-city='" + data[i].local + "' data-data='" + data[i].data + "' >" + data[i].nomeAntena + "</option>");
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
    carregarmapa([[$('#SensorSelect').find(":selected").data("city"),
        $('#SensorSelect').find(":selected").data("lat"),
        $('#SensorSelect').find(":selected").data("log")]],
            $("#mapSensor")[0]);
  },
  render: function () {
    $(this.el).html(this.template());
    return this;
  }
});
