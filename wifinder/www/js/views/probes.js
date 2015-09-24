/* global moment */

window.ProbesView = Backbone.View.extend({
  lastprob: "",
  events: {
    "click .linkprobe": "listDevicesToProbe",
    "click .linkprobe2": function (e) {
      e.preventDefault();
    }
  },
  initialize: function () {
  },
  resizeCanvas: function () {
    canvas.width = $("#myCanvasContainer").innerWidth() * 0.95;
    canvas.height = $("#myCanvasContainer").innerHeight();

  },
  init: function (selectProb) {
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
      textFont: 'Impact,Arial Black,sans-serif',
      textColour: '#00f',
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
//      weightFrom: 'data-weight',
      fadeIn: 800,
      shape: "vcylinder"
    };

    modem("GET",
            "/getAllprobes/" + window.profile.id,
            function (data) {
              var listprobes = "";
              if (data.length > 0) {
                for (var i in data) {
                  listprobes += '<a href="#" class="linkprobe">' + data[i] + '</a>'
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
                  dataSet.push([
                    data[i].macAddess,
                    data[i].vendor,
                    moment(data[i].First_time * 1000).format('YYYY/MM/DD HH:mm'),
                    moment(data[i].Last_time.Last_time * 1000).format('YYYY/MM/DD HH:mm'),
                    prb,
                    data[i].Last_time.BSSID
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
