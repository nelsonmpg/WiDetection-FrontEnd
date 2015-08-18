window.DetailDeviceView = Backbone.View.extend({
    device: undefined,
    deviceDetails: undefined,
    events: {
        "click a.selectSensor": "selectSensor",
        "click .deviceSearch": "selectDevice",
        "click #selectDropdownFabricante > li > a": function(e){
        e.preventDefault();
        e.stopPropagation();
        }
    },
    initialize: function () {
        //this.render();
    },
    init: function () {
        var self = this;
        modem("GET",
                "/getDispMacbyVendor/" + window.profile.id,
                function (data) {
                    console.log(data);
                    var html = "";
                    for (var i in data) {
                        html = html + "<li class='dropdown-submenu'><a href='#'>" + data[i].group + "</a>" +
                                "<ul class='dropdown-menu'>";
                        for (var a in data[i].reduction) {
                            html = html + "<li><a class='deviceSearch' href='#'>" + data[i].reduction[a] + "</a></li>";
                        }
                        html = html + "</ul></li>";
                    }
                    $("#selectDropdownFabricante").append(html);
                    console.log($(".deviceSearch").first().click());
                },
                function (xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {}
        );
    },
    selectDevice: function (e) {
        var self = this;
        e.preventDefault();
        e.stopPropagation();

        self.device = $(e.currentTarget).text();
        self.deviceDetails = [];

        modem("GET",
                "/getDispbyMac/" + window.profile.id + "/" + self.device,
                function (data) {
                    console.log(data);
                    var chart = new ArrayToGraph().CreatechartPower(data, "chartContainer");
                    var dataSet = [], probes = "";
                    for (var a in data.Probed_ESSIDs) {
                        probes = probes + "</br>" + data.Probed_ESSIDs[a]
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

        $("#label-info-device").text(self.device + " - " + $(e.currentTarget).parent().parent().prev().text());
        
        $("#dLabel").click();

    },
    render: function () {
        $(this.el).html(this.template());
        return this;
    }
});
