/* global moment */

window.ProbesView = Backbone.View.extend({
  lastprob: "",
  allap: [],
  events: {
    "click .linkprobe": "listDevicesToProbe",
    "click .linkprobe2": function (e) {
      e.preventDefault();
    },
    "click .APjump": "openDetailAp",
    "click .Dispjump": "openDetailDisp"
  },
  initialize: function () {
  },
  resizeCanvas: function () {
    canvas.width = $("#myCanvasContainer").innerWidth() * 0.95;
    canvas.height = $("#myCanvasContainer").innerHeight();
  },
  openDetailAp: function (e) {
    e.preventDefault();
    e.stopPropagation();
    if ($(e.currentTarget).context.attributes[5].nodeValue != "Unknown") {
      window.profile.set("nav-mac", $(e.currentTarget).data("mac"));
    } else {
      window.profile.set("nav-mac", Object.keys(this.allap)[0]);
    }

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
  init: function (selectProb) {
    var self = this;
    var canvas = document.getElementById('myCanvas');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
      canvas.width = $("#myCanvasContainer").innerWidth() * 0.95;
      canvas.height = $("#myCanvasContainer").innerHeight();
    }
    resizeCanvas();

    var options = {
      interval: 20,
      reverse: true,
      textFont: 'Impact,Arial Black,sans-serif',
      textColour: null,
      textHeight: 15,
      outlineColour: '#f96',
      outlineThickness: 5,
      maxSpeed: 0.04,
      minBrightness: 0.1,
      depth: 0.92,
      pulsateTo: 0.2,
      pulsateTime: 0.75,
      initial: [0.1, -0.1],
      decel: 0.98,
      hideTags: false,
      shadow: '#ccf',
      shadowBlur: 3,
      weight: true,
      weightFrom: 'data-weight',
      weightMode: "colour",
      fadeIn: 800,
      shape: "vcylinder"
    };
    modem("GET",
            "/getAllAP/" + window.profile.id,
            function (data) {
              var values = [];
              for (var i in data) {
                values[data[i].group[1]] = {
                  "bssid": data[i].group[1],
                  "name": data[i].group[0]
                };
              }
              self.allap = values;
              modem("GET",
                      "/getAllprobes/" + window.profile.id,
                      function (data) {
                        var listprobes = "";
                        if (data.length > 0) {
                          for (var i in data) {
                            listprobes += '<a href="#" data-weight="' + Math.random() + '" class="linkprobe">' + data[i] + '</a>'
                          }
                          $("#probes-list").html(listprobes);
                        } else {
                          listprobes = '<a href="#" class="linkprobe2">No Probes</a>';
                        }
                        $("#probes-list").html(listprobes);
                        if (selectProb) {
                          $("#probes-list a:contains('" + selectProb + "')").click();
                        } else {
                          $("#probes-list a:first").click();
                        }
                        try {
                          TagCanvas.Start('myCanvas', 'probes-list', options);
                        } catch (e) {
                          // something went wrong, hide the canvas container
                          document.getElementById('myCanvas').style.display = 'none';
                        }
                      },
                      function (xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                      }, {}
              );
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
    $.AdminLTE.boxWidget.activate();
  },
  listDevicesToProbe: function (e) {
    var self = this;
    e.preventDefault();
    var prob = $(e.currentTarget).text();
    TagCanvas.TagToFront('myCanvas', {text: prob, active: true});
    if (self.lastprob !== prob) {
      self.lastprob = prob;
      modem("GET",
              "/getDeviceByProbe/" + window.profile.id + "/" + prob,
              function (data) {
                $("#table-probe").html("Devices Contains this Probe <b>" + prob + "</b>");
                var dataSet = [];
                for (var i in data) {
                  var prb = "";
                  for (var j in data[i].probes) {
                    if (data[i].probes[j] === prob) {
                      prb += '<a href="#" class="linkprobe" style="color: black;"><b><u><i>' + data[i].probes[j] + "</i></u></b></a><br>";
                    } else {
                      prb += '<a href="#" class="linkprobe">' + data[i].probes[j] + "</a><br>";
                    }
                  }
                  var macName = (data[i].Last_time.BSSID === "(notassociated)") ? "" : data[i].Last_time.BSSID;
                  dataSet.push([
                    "<a href='#' data-vendor='" + data[i].macAddess + "' class='Dispjump'>" + data[i].macAddess + "</a>",
                    data[i].vendor,
                    moment(data[i].First_time * 1000).format('YYYY/MM/DD HH:mm'),
                    "<span data-toggle='tooltip' title='" + moment(data[i].Last_time.Last_time * 1000).format('YYYY/MM/DD HH:mm') + "'> " + moment(data[i].Last_time.Last_time * 1000).fromNow() + "</span>", 
                    prb,
                    "<a href='#' class='APjump' data-toggle='tooltip' title=" + (typeof self.allap[macName] == "undefined" ? "Unknown" : self.allap[macName].name)  + " data-mac='" + data[i].Last_time.BSSID + "'>" + macName + "</a>"
                  ]);
                }

                $('#table-devices-probe').DataTable({
                  "data": dataSet,
                  "paging": true,
                  "lengthChange": false,
                  "searching": true,
                  "ordering": true,
                  "info": true,
                  "autoWidth": true,
                  "destroy": true
                });
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
