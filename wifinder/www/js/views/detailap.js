window.DetailAPView = Backbone.View.extend({
  ap: undefined,
  allap: [],
  net: undefined,
  events: {
    "click a.selectSensor": "selectSensor",
    "change #ApSelect": "setAp"
  },
  initialize: function () {
  },
  init: function (mac) {
    var self = this;
    modem("GET",
            "/getAllAP/" + window.profile.id,
            function (data) {
              var values = [];
              for (var ssid in data[0].group[0]) {
                values[data[0].group[0][ssid]] = {
                  "bssid": data[0].group[0][ssid],
                  "name": data[0].group[1][ssid],
                  "value": data[0].reduction[0][ssid]
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
  },
  setAp: function () {
    this.ap = $('#ApSelect').find(":selected").data("mac");
    this.getDisps(this.ap);
    if (this.ap != "all") {
      this.ApHourChart(this.ap);
    }
  },  
  getDisps: function (mac) {
    var self = this;
    if (this.net != undefined) {
      this.net.destroy();
      this.net = null;
    }
    if (mac == "all") {
      self.networkAllAP(self.allap);
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
            code: '\uf1eb',
            size: 50,
            color: '#00ff00'
          }
        },
        device: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf108',
            size: 50,
            color: '#eeeeee'
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
  networkAllAP: function (macs) {
    var self = this;
    var xnodes = [];
    var xedges = [];
    var devices = [];
    for (var a in macs) {
      if (devices.indexOf(macs[a].bssid.trim()) < 0) {
        devices.push(macs[a].bssid.trim());
        xnodes.push({id: devices.indexOf(macs[a].bssid.trim()) + 1, label: self.allap[macs[a].bssid].name + "\n" + macs[a].bssid.trim(), group: "ap"});
      }

      modem("GET",
              "/getDispConnectedtoAp/" + window.profile.id + "/" + macs[a].bssid,
              function (data) {
                for (var i in data[0]) {
                  if (devices.indexOf((data[0][i].macAddress).trim()) < 0) {
                    devices.push((data[0][i].macAddress).trim());
                    xnodes.push({id: devices.indexOf((data[0][i].macAddress).trim()) + 1, label: data[0][i].nameVendor + "\n" + data[0][i].macAddress, group: "device"});
                  }
                  if (_.where(xedges, {from: devices.indexOf(data[1].trim()) + 1, to: devices.indexOf((data[0][i].macAddress).trim()) + 1}) == 0) {
                    xedges.push({from: devices.indexOf(data[1].trim()) + 1, to: devices.indexOf((data[0][i].macAddress).trim()) + 1});
                  }
                }
                if (data[1] == macs[a].bssid) { //se for o ultimo ap

                  modem("GET",
                          "/getDispMacbyVendor/" + window.profile.id,
                          function (data) {
                            console.log(data);
                            for (var c in data) {
                              for (var d in data[c].reduction) {
                                if (devices.indexOf((data[c].reduction[d]).trim()) < 0) {
                                  devices.push((data[c].reduction[d]).trim());
                                  xnodes.push({id: devices.indexOf((data[c].reduction[d]).trim()) + 1, label: data[c].group + "\n" + data[c].reduction[d], group: "device"});
                                }
                              }
                            }

                            self.fazergrafico(xedges, xnodes);
                          },
                          function (xhr, ajaxOptions, thrownError) {
                            var json = JSON.parse(xhr.responseText);
                            error_launch(json.message);
                          }, {}
                  );
                }

              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {}
      );
    }

  },
  fazergrafico: function (xedges, xnodes) {
    var self = this;
    // xnodes.push({id: 1, label: $('#ApSelect').find(":selected").text(), group: "ap"});

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
          "roundness": 0
        }
      },
      groups: {
        ap: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf1eb',
            size: 50,
            color: '#00ff00'
          }
        },
        device: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf108',
            size: 50,
            color: '#eeeeee'
          }
        }
      }
    };
    if (this.net != undefined) {
      this.net.destroy();
      this.net = null;
    }
    // initialize your network!
    self.net = new vis.Network(container, data, options);
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
