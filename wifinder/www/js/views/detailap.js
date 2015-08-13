window.DetailAPView = Backbone.View.extend({
    ap: undefined,
    allap: [],
    net: undefined,
    events: {
        "click a.selectSensor": "selectSensor",
        "change #ApSelect": "setAp"
    },
    initialize: function () {
        //this.render();
    },
    init: function () {
        this.carregarSelect();
        if (this.mac != null) {
            $("#ApSelect > option[data-mac='" + this.mac + "']").select();
        }
    },
    setAp: function () {
        this.ap = $('#ApSelect').find(":selected").data("mac");
        this.getDisps(this.ap);
        if (this.ap != "all") {
        this.ApHourChart(this.ap);
        }
    },
    carregarSelect: function () {
        var self = this;
        modem("GET",
                "/getAllAP/" + window.profile.id,
                function (data) {
                    var values = [];
                    for (var sensor in data) {
                        for (var rede in data[sensor].group[0]) {
                            values[data[sensor].group[0][rede]] = data[sensor].group[1][rede];
                        }
                    }
                    _(values).sortBy(function (obj) {
                        return obj.toString
                    });
                    for (var i in values) {
                        self.allap.push(i);
                        $("#ApSelect").append("<option data-mac='" + i + "' >" + ((values[i] == "") ? "Hidden network" : values[i]) + " - (" + i + ")</option>");
                    }
                    $("#ApSelect").append("<option data-mac='all'> All Access Points </option>");
                },
                function (xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {}
        );
    },
    getDisps: function (mac) {
        var self = this;
        if (this.net != undefined) {
            this.net.destroy();
            this.net = null;
        }
        if (mac == "all") {
            self.networkAllAP(self.allap);
        } else {
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
            if (devices.indexOf(macs[a].trim()) < 0) {
                devices.push(macs[a]);
                xnodes.push({id: devices.indexOf(macs[a].trim()) + 1, label: "Access Point\n" + macs[a].trim(), group: "ap"});
            }

            modem("GET",
                    "/getDispConnectedtoAp/" + window.profile.id + "/" + macs[a],
                    function (data) {
                        for (var i in data[0]) {
                            if (devices.indexOf((data[0][i].macAddress).trim()) < 0) {
                                devices.push((data[0][i].macAddress).trim());
                                xnodes.push({id: devices.indexOf((data[0][i].macAddress).trim()) + 1, label: data[0][i].nameVendor + "\n" + data[0][i].macAddress, group: "device"});
                            }
                            if (_.where(xedges, {from: devices.indexOf(data[1].trim()), to: devices.indexOf((data[0][i].macAddress).trim()) + 1}) ==  0){
                            xedges.push({from: devices.indexOf(data[1].trim()), to: devices.indexOf((data[0][i].macAddress).trim()) + 1});
                            }
                        }
                        if (data[1] == macs[a]) { //se for o ultimo ap
                            self.fazergrafico(xedges, xnodes);
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
                    console.log(data);
                    var count, tmp = [], yes = false;
                    while (first < last) {
                        count = 0, yes = false;
                        for (var a in data) {
                            for (var b in data[a].disp) {
                                for (var c in data[a].disp[b].values) {
                                    if (first.startOf("hour") <= moment(data[a].disp[b].values[c].Last_time * 1000) <= first.endOf("hour")) {
                                        console.log(moment(data[a].disp[b].values[c].Last_time * 1000));
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
                    console.log(tmp);
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
