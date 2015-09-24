/* global app */

window.DetailDeviceView = Backbone.View.extend({
  loadingState: '<div class="overlay text-center"><i class="fa fa-refresh fa-spin"></i></div>',
  device: undefined,
  deviceDetails: undefined,
  events: {
    "click .deviceSearch": "selectDevice",
    "click #selectDropdownFabricante > li > a": function (e) {
      e.preventDefault();
      e.stopPropagation();
    },
    "click .selectprob": function (e) {
      e.preventDefault();
      window.profile.set("probe", $(e.currentTarget).text());
      app.navigate("Probes", {
        trigger: true
      });
    }
  },
  initialize: function () {
    //this.render();
  },
  init: function (obj) {
    $("#chartContainer").html(this.loadingState);
    var self = this;
    modem("GET",
            "/getDispMacbyVendor/" + window.profile.id,
            function (data) {
              var html = "";
              for (var i in data) {
                html = html + "<li class='dropdown-submenu'><a href='#'>" + ((data[i].group == "") ? "Unknown" : data[i].group) + "</a>" +
                        "<ul class='dropdown-menu'>";
                for (var a in data[i].reduction) {
                  html = html + "<li><a class='deviceSearch' href='#'>" + data[i].reduction[a] + "</a></li>";
                }
                html = html + "</ul></li>";
              }
              $("#selectDropdownFabricante").append(html);

              if (obj.length != 0) {
                $("#selectDropdownFabricante li:contains('" + obj.vendor + "') ul li:contains('" + obj.mac + "') a.deviceSearch").click();
              } else {
                $("#selectDropdownFabricante li:first ul li:first a.deviceSearch").click();
              }

            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
    $.AdminLTE.boxWidget.activate();
  },
  selectDevice: function (e) {
    $("#chartContainer").html(this.loadingState);
    var self = this;
    e.preventDefault();
    e.stopPropagation();
    self.device = $(e.currentTarget).text();
    self.deviceDetails = [];
    modem("GET",
            "/getDispbyMac/" + window.profile.id + "/" + self.device,
            function (data) {
              var chart = new ArrayToGraph(data, "chartContainer", "line");
              chart.createArrayToGraphLine();
              var dataSet = [], probes = "";
              for (var a in data.Probed_ESSIDs) {
                probes = probes + "<a class='selectprob' href='#'>" + data.Probed_ESSIDs[a] + "</a></br>"
              }
              dataSet.push([
                data.macAddress,
                data.nameVendor,
                probes
              ]);

              $('#tblDetailsDevice').DataTable({
                "data": dataSet,
                "paging": false,
                "lengthChange": false,
                "searching": false,
                "ordering": false,
                "info": false,
                "autoWidth": true,
                "destroy": true
              });

            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
    $("#label-info-device").text($(e.currentTarget).parent().parent().prev().text() + " - " + self.device);
    $("body").click();
  },
  render: function () {
    $(this.el).html(this.template());
    return this;
  }
});
