  window.DetailAPView = Backbone.View.extend({
      sensor: undefined,
      events: {
          "click a.selectSensor": "selectSensor",
          "change #SensorSelect": "setsensor"
      },
      initialize: function () {
          //this.render();
      },
      init: function () {
          modem("GET",
              "/getAllAP/" + window.profile.id ,
              function (data) {
                  var values = [], dataSet = [];

                  for (var i in data) {
                      console.log(data[i]);
                  }


              },
              function (xhr, ajaxOptions, thrownError) {
                  var json = JSON.parse(xhr.responseText);
                  error_launch(json.message);
              }, {}
          );
      },
      render: function () {
          $(this.el).html(this.template());
          return this;
      }
  });
