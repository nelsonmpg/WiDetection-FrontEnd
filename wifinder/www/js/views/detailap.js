window.DetailAPView = Backbone.View.extend({
  ap: undefined,
  allap: [],
  net: undefined,
  events: {
    "change #ApSelect": "setAp"
  },
  initialize: function () {
  },
  init: function (mac) {
    var self = this;
    modem("GET",
            "/getAllAP/" + window.profile.id,
            function (data) {
              console.log(data);
              var values = [];
               for (var i in data) {
                values[data[i].group[1]] = {
                  "bssid": data[i].group[1],
                  "name": data[i].group[0],
                  "value": data[i].reduction[0]
                };
              }
              self.allap = values;
              for (var i in values) {
                $("#ApSelect").append("<option data-mac='" + i + "' >" + ((values[i].name == "") ? "Hidden network" : values[i].name) + " - (" + i + ")</option>");
              }
              $("#ApSelect").append("<option data-mac='all'> All Access Points </option>");
              if (mac != null) {
                $("#ApSelect > option:contains('" + mac + "')").attr('selected', true).change();
              } else {
                $("#ApSelect option:first-child").change();
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
    $.AdminLTE.boxWidget.activate();
  },
  setAp: function () {
    this.ap = $('#ApSelect').find(":selected").data("mac");
    this.getDisps(this.ap);
    if (this.ap != "all") {
      this.ApHourChart(this.ap);
      this.loadChart(this.ap);
      $(".row-chart").show();
    } else {
      $(".row-chart").hide();
    }
  },
  loadChart: function (mac) {
    modem("GET",
            "/getApbyMac/" + window.profile.id + "/" + mac,
            function (data) {
              var chart = new ArrayToGraph(data, "chartContainer", "line");
              chart.createArrayToGraphLine();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  getDisps: function (mac) {
    $(".showScale").hide();
    var self = this;
    if (this.net != undefined) {
      this.net.destroy();
      this.net = null;
    }
    if (mac == "all") {
//      self.networkAllAP(self.allap);
  makeAllNetwork(self.allap,'mynetwork');
      $("#div-row-table-ap").hide();
    } else {
      $("#div-row-table-ap").show();
      var dataSet = [];
      dataSet.push([
        self.allap[mac].bssid,
        self.allap[mac].name,
        self.allap[mac].value.Authentication,
        self.allap[mac].value.Cipher,
        self.allap[mac].value.Privacy,
        self.allap[mac].value.channel
      ]);
      $('#tblAp').DataTable({
        "data": dataSet,
        "paging": false,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": false,
        "autoWidth": true,
        "destroy": true
      });



      modem("GET",
              "/getDispConnectedtoAp/" + window.profile.id + "/" + mac,
              function (data) {
                self.network(data[0]);
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {}
      );
    }
  },
  network: function (data) {
    var xnodes = [];
    var xedges = [];
    xnodes.push({id: 1, label: $('#ApSelect').find(":selected").text(), group: "ap"});
    for (var i in data) {
      xnodes.push({id: i + 2, label: data[i].nameVendor + "\n" + data[i].macAddress, group: "device"});
      xedges.push({from: 1, to: (i + 2)});
    }
    // create 2 array with edges and nodes
    var edges = new vis.DataSet(xedges);
    var nodes = new vis.DataSet(xnodes);
    // create a network
    var container = document.getElementById('mynetwork');
    // provide the data in the vis format
    var data = {
      nodes: nodes,
      edges: edges
    };
    var options = {
      "edges": {
        "smooth": {
          "roundness": 1
        }
      },
      groups: {
        ap: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf140',
            size: 50,
            color: '#00ff00'
          }
        },
        device: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf10b',
            size: 50,
            color: '#7e7e7e'
          }
        }
      }
    };
    if (this.net != undefined) {
      this.net.destroy();
      this.net = null;
    }
    // initialize your network!
    this.net = new vis.Network(container, data, options);
  },
  ApHourChart: function (mac) {
    self = this;
    modem("GET",
            "/getApFirstTime/" + window.profile.id + "/" + mac,
            function (data) {
              var first = moment(data[0] * 1000);
              var last = moment(data[1] * 1000);
              self.makeChart(first, last, mac);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  makeChart: function (first, last, mac) {
    modem("GET",
            "/getDispConnectedtoAp/" + window.profile.id + "/" + mac,
            function (data) {
              var count, tmp = [], yes = false;
              while (first < last) {
                count = 0, yes = false;
                for (var a in data) {
                  for (var b in data[a].disp) {
                    for (var c in data[a].disp[b].values) {
                      if (first.startOf("hour") <= moment(data[a].disp[b].values[c].Last_time * 1000) <= first.endOf("hour")) {
                        count++;
                        yes = true;
                        break;
                      }
                    }
                    if (yes) {
                      break;
                    }
                  }
                }
                tmp.push({hour: first.startOf("hour"), value: count});
                first.add(1, "h");
              }
              tmp.push({hour: first.startOf("hour"), value: count});
              first.add(1, "h");
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
