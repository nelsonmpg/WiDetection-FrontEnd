var Host = function (local, nome, lat, long, image) {
    this.local = local;
    this.nome = nome;
    this.lat = lat;
    this.long = long;
    this.image = image;
    switch (local) {
        case "#divAntenas":
            this.typegraph = "now";
            break;
        case "#chartContainer":
            this.typegraph = "all";
            break;
    }
};

Host.prototype.createAndAddToDivHost = function () {
    $("body").find(this.local).append("<div class='mdl-color--white mdl-shadow--2dp  col-sm-2 col-md-2 col-lg-2'><div class='divAntena' data-tipo='" + this.typegraph + "' data-local='" + this.local + "' data-nomeAntena='" + this.nome + "'>" +
            "<img src='" + this.image + "'>" +
            "<p class='text-center'>" + this.nome + "</p>" +
            "<div>" +
            "<p class='text-center coordenadas'>lat: " + this.lat + "</p>" +
            "<p class='text-center coordenadas'>lon: " + this.long + "</p>" +
            "</div></div>" +
            "<button type='button' class='btn btn-default mapOpen' data-nomeAntena='" +
            this.nome +
            "' data-lat='" + this.lat +
            "' data-lon='" + this.long +
            "'><span class='glyphicon glyphicon-eye-open'></span> Ver no Mapa</button>" +
            "</div>");
};

var Ap = function (local, Authentication, Cipher, ESSID, Power, Privacy, macAddress, nameVendor) {
    this.local = local;
    this.Authentication = Authentication;
    this.Cipher = Cipher;
    this.ESSID = ESSID;
    this.Power = Power;
    this.Privacy = Privacy;
    this.macAddress = macAddress;
    this.nameVendor = nameVendor;
    this.image = "./images/acesspoint.png";
};

Ap.prototype.createAndAddToDivAp = function () {
    $("body").find(this.local).append("<div class='divBoxItem mdl-color--white mdl-shadow--2dp  col-sm-2 col-md-2 col-lg-2' data-macAddress='" + this.macAddress + "'>" +
            "<img src='" + this.image + "'>" +
            "<p class='text-center'>" + this.ESSID + "</p>" +
            "<div>" +
            "<p class='text-center'>Mac.Address: " + this.macAddress + "</p>" +
            "<p class='text-center'>Aut: " + this.Authentication + "</p>" +
            "</div>");
};

var Disp = function (local, BSSID, Power, Probed_ESSIDs, macAddress, nameVendor) {
    this.local = local;
    this.BSSID = BSSID;
    this.Power = Power;
    this.Probed_ESSIDs = Probed_ESSIDs;
    this.macAddress = macAddress;
    this.nameVendor = nameVendor;
    this.image = "./images/device.png";
};

Disp.prototype.createAndAddToDivDisp = function () {
    $("body").find(this.local).append("<div class='divBoxItem mdl-color--white mdl-shadow--2dp  col-sm-2 col-md-2 col-lg-2' data-macAddress='" + this.macAddress + "'>" +
            "<img src='" + this.image + "'>" +
            "<p class='text-center'>" + this.nameVendor + "</p>" +
            "<div>" +
            "<p class='text-center'>Power: " + this.Power + "</p>" +
            "<p class='text-center'>Aut: " + this.BSSID + "</p>" +
            "</div>");
};
