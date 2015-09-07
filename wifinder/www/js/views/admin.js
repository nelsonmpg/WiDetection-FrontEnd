window.AdminView = Backbone.View.extend({
  chsckedTrue: "<span><i class='fa fa-power-off fa-2x' style='text-shadow: 2px 2px 2px #ccc; color: green;'></i></span>",    //'<input type="checkbox" checked="true" disabled>',
  chsckedFalse: "<span><i class='fa  fa-circle-o-notch fa-2x' style='text-shadow: 2px 2px 2px #ccc; color: red;'></i></span>",  //'<input type="checkbox" disabled>',
  socketAdmin: undefined,
  events: {
    "keyup #urlvendor": "checkvendorslist",
    "change #urlvendor": "checkvendorslist",
    "click #addlistvendors": function () {
      $("#linkurl").text($("#urlvendor").val());
      $(".closeModal").attr("disabled", false);
      $("#yesclick").attr("disabled", false);
      $("#linkurl").next().remove();
      $("#modalInsertUrl").show();
    },
    "click #yesclick": "addvendorslist",
    "click .removesite": "removeSite",
    "click .removesensor": "removeSensor",
    "click #removeok": "removeSensorSite",
    "click .closeModal": function () {
      $("#modalInsertUrl").hide();
      $("#modalRemove").hide();
      $("#linkurl").text("");
    }
  },
  initialize: function (skt) {
    this.socketAdmin = skt;
  },
  init: function () {
    var self = this;
    modem("GET",
            "/getsitesAndSensores",
            function (data) {
              var tableSite = '<table class="table table-bordered"><tbody>' +
                      '<tr><th style="width: 10px">#</th><th>Site Name</th><th>Sensors</th><th></th></tr>';
              for (var i in data) {
                tableSite += '<tr><td class="center-vertical">' + i + '</td> ' +
                        '<td class="center-vertical site-name">' + data[i].db + '</td>' +
                        '<td><table class="table table-bordered" data-numSensors="' + data[i].numSensor + '"><tbody>' +
                        '<tr><th style="width: 10px">#</th><th>Sensor Name</th><th>Date</th><th>Active in Last 5 minutes</th><th></th></tr>';
                for (var j in data[i].sensors) {
                  tableSite += '<tr><td>' + j + '</td>' +
                          '<td class="center-vertical sensor-name">' + data[i].sensors[j].nomeAntena + '</td>' +
                          '<td class="center-vertical">' + moment(data[i].sensors[j].data).format('DD/MM/YYYY HH:mm:ss') + '</td>' +
                          '<td class="center-vertical">' + ((checkSensorActive(data[i].sensors[j].data)) ? self.chsckedFalse : self.chsckedTrue) + '</td>' +
                          '<td class="center-vertical"><button class="btn btn-default removesensor">Remove Sensor</button></td></tr>';
                }
                tableSite += '</tbody></table></td><td class="center-vertical"><button class="btn btn-default removesite">Remove Site</button></td></tr>';
              }
              tableSite += '</tbody></table>';

              $("#tablelistSitesAndSensores").html(tableSite);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {
      url: $("#urlvendor").val()
    }
    );

    $.AdminLTE.boxWidget.activate();
  },
  checkvendorslist: function () {
    var urlPattern = new RegExp('(http|ftp|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?', 'i');
    if (urlPattern.test($("#urlvendor").val())) {
      $(".validUrl").children().removeClass("fa-times").addClass("fa-check");
      $("#addlistvendors").attr("disabled", false);
    } else {
      $(".validUrl").children().removeClass("fa-check").addClass("fa-times");
      $("#addlistvendors").attr("disabled", true);
    }

  },
  addvendorslist: function () {
    $(".closeModal").attr("disabled", true);
    $("#yesclick").attr("disabled", true);
    $('<p>Please wait a moment, the system insert values.<i class="fa fa-refresh fa-spin"></i></p>').insertAfter("#linkurl");
    modem("POST",
            "/addVendors",
            function (data) {
              $(".closeModal").attr("disabled", false);
              $("#linkurl").next().remove();
              $('<p> Inserted <i class="fa fa-arrow-right"></i> ' + data.inserted + '</p>').insertAfter("#linkurl");
              $("#urlvendor").val("").trigger("keyup");
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {
      url: $("#urlvendor").val()
    });
  },
  removeSite: function (e) {
    var $row = $(e.currentTarget).closest("tr");
    var $text = $row.find(".site-name").text();
    $("#modalRemove .modal-body").html("<p>Remove this site?<br>" + $text + "</p>");
    $("#modalRemove").attr("data-sitename", $text);
    $("#modalRemove").show();
    $(".closeModal").attr("disabled", false);
    $("#removeok").attr("disabled", false);
  },
  removeSensor: function (e) {
    var $row = $(e.currentTarget).closest("tr");
    var $text = $row.find(".sensor-name").text();
    var $row2 = $(e.currentTarget).parent().parent().parent().parent().parent().closest("tr");
    var $text2 = $row2.find(".site-name").text();
    var numsensor = $(e.currentTarget).parent().parent().parent().parent().data("numsensors");
    if (numsensor > 1) {
      $("#modalRemove .modal-body").html("<p>Remove this sensor?<br>" + $text + " in this site " + $text2 + "</p>");
      $("#modalRemove").attr("data-sitename", $text2);
      $("#modalRemove").attr("data-sensorname", $text);
    } else {
      $("#modalRemove .modal-body").html("<p>This site only contains a sensor '" + $text + "'.<br>To remove it from the site '" + $text2 + "' will be also removed.</p>");
      $("#modalRemove").attr("data-sitename", $text2);
    }
    $(".closeModal").attr("disabled", false);
    $("#removeok").attr("disabled", false);
    $("#modalRemove").show();
  },
  removeSensorSite: function () {
    var self = this;
    $(".closeModal").attr("disabled", true);
    $("#removeok").attr("disabled", true);
    $('<p>Please wait a moment.<i class="fa fa-refresh fa-spin"></i></p>').insertAfter("#modalRemove .modal-body p");
    if ($("#modalRemove").data("sensorname")) {
      modem("POST",
              "/removeSensor",
              function (data) {
                console.log(data);
                self.init();
                $(".closeModal").attr("disabled", false);
                $("#modalRemove").hide();
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {
        site: $("#modalRemove").data("sitename"),
        sensor: $("#modalRemove").data("sensorname")
      });
    } else {
      modem("POST",
              "/removeSite",
              function (data) {
                console.log(data);
                self.init();
                $(".closeModal").attr("disabled", false);
                $("#modalRemove").hide();
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {
        site: $("#modalRemove").data("sitename")
      });
    }
    $("#modalRemove").attr("data-sitename", null);
    $("#modalRemove").attr("data-sensorname", null);
  },
  render: function () {
    $(this.el).html(this.template());
    return this;
  }
});
