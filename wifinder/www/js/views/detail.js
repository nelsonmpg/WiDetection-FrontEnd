  window.DetailView = Backbone.View.extend({
      events: {
          "click a.selectSensor": "selectSensor",
          "change #SensorSelect": "setsensor"
      },
      initialize: function () {
          //this.render();
      },
      init: function () {
          //alert("DetailView Inicializada");
          function cb(start, end) {
              $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
          }
          cb(moment().subtract(29, 'days'), moment());

          $('#reportrange').daterangepicker({
              ranges: {
                  'Today': [moment(), moment()],
                  'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                  'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                  'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                  'This Month': [moment().startOf('month'), moment().endOf('month')],
                  'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
              }
          }, cb);


          var locations = [];
          locations.push(["data[i].nomeAntena", 27, 27]);


          map = new google.maps.Map(document.getElementById('mapSensor'), {
              zoom: 11,
              center: new google.maps.LatLng(27, 27),
              mapTypeId: google.maps.MapTypeId.ROADMAP
          });

          var infowindow = new google.maps.InfoWindow();

          var marker, i;

          for (i = 0; i < locations.length; i++) {
              marker = new google.maps.Marker({
                  position: new google.maps.LatLng(27, 27),
                  map: map,
                  icon: 'http://www.daytonabeachresort.com/flashcab/directory/social-icons/Map_marker.png'
              });
              google.maps.event.addListener(marker, 'click', (function (marker, i) {
                  return function () {
                      infowindow.setContent(locations[i][0]);
                      infowindow.open(map, marker);
                  }
              })(marker, i));
          }
          ;

          this.getSensors();
      },
      selectSensor: function (e) {
          e.preventDefault();
          e.stopPropagation();
      },
      getSensors: function (e) {
          modem("GET",
              "/getSensors/" + window.profile.id,
              function (data) {
                  for (var i in data) {
                      $("#SensorSelect").append("<option data-log='" + data[i].longitude + "' data-lat='" + data[i].latitude + "' data-city='" + data[i].local + "' data-data='" + data[i].data + "' >" + data[i].nomeAntena + "</option>");
                  }
              },
              function (xhr, ajaxOptions, thrownError) {
                  var json = JSON.parse(xhr.responseText);
                  error_launch(json.message);
              }, {}
          );
      },
      setsensor: function () {
          console.log($('#SensorSelect').find(":selected").data("city"));
          carregarmapa([[$('#SensorSelect').find(":selected").data("city"),
              $('#SensorSelect').find(":selected").data("lat"),
              $('#SensorSelect').find(":selected").data("lon")]],
              $("#mapSensor")[0]);
      },
      render: function () {
          $(this.el).html(this.template());
          return this;
      }
  });
