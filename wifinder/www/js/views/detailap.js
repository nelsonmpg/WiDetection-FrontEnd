window.DetailAPView = Backbone.View.extend({
    ap: undefined,
    events: {
        "click a.selectSensor": "selectSensor",
        "change #ApSelect": "setAp"
    },
    initialize: function () {
        //this.render();
    },
    init: function () {
        this.carregarSelect();
        console.log(this.mac);
        if (this.mac != null) {
            $("#ApSelect > option[data-mac='" + this.mac + "']").select();
        }
    },
    setAp: function () {
        this.ap = $('#ApSelect').find(":selected").data("mac");
        this.getDisps(this.ap);
    },
    carregarSelect: function () {
        modem("GET",
                "/getAllAP/" + window.profile.id,
                function (data) {
                    var values = [];
                    for (var sensor in data) {
                        for (var rede in data[sensor].group[0]) {
                            values[data[sensor].group[0][rede]] = data[sensor].group[1][rede];
                        }
                    }
                    for (var i in values) {
                        $("#ApSelect").append("<option data-mac='" + i + "' >" + ((values[i] == "") ? "Hidden network" : values[i]) + " - (" + i + ")</option>");
                    }
                },
                function (xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {}
        );
    },
    getDisps: function (mac) {
        var self = this;
        modem("GET",
                "/getDispConnectedtoAp/" + window.profile.id + "/" + mac,
                function (data) {
                    console.log(data);
                    self.network(data);
                },
                function (xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {}
        );
    },
    network: function (data) {
        var xnodes = [];
        var xedges = [];
        xnodes.push({id: 1, label: $('#ApSelect').find(":selected").text(),group:"ap"});
        for (var i in data) {
            xnodes.push({id: i + 2, label: data[i].nameVendor + "\n" + data[i].macAddress,group:"device"});
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

        // initialize your network!
        var network = new vis.Network(container, data, options);



        }
        ,
                render: function () {
                $(this.el).html(this.template());
                return this;
            }
});
