var Host = function (local, nome, lat, long) {
    this.local = local;
    this.nome = nome;
    this.lat = lat;
    this.long = long;
    this.image = "./images/wifi2.gif";
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
    $("body").find(this.local).append("<div class='divBoxItem mdl-color--white mdl-shadow--2dp  col-xs-4 col-sm-3'><div class='divAntena' data-tipo='" + this.typegraph + "' data-local='" + this.local + "' data-nomeAntena='" + this.nome + "'>" +
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
    this.ESSID = ((ESSID != "") ? ESSID : "Rede Oculta");
    this.Power = Power;
    this.Privacy = Privacy;
    this.macAddress = macAddress;
    this.nameVendor = nameVendor;
    this.image = "./images/acesspoint2.gif";
};

Ap.prototype.createAndAddToDivAp = function () {
    $("body").find(this.local).append("<div class='divBoxItem showApDetail mdl-color--white mdl-shadow--2dp  col-xs-4 col-sm-3' style='opacity: 0' data-macAddress='" + this.macAddress + "'>" +
            "<img src='" + this.image + "'>" +
            "<p class='text-center nome'>" + this.ESSID + "</p>" +
            "<div>" +
            "<p class='text-center'>Mac.Address: " + this.macAddress + "</p>" +
            "<p class='text-center'>Aut: " + this.Authentication + "</p>" +
            "</div>");

    $("body").find(this.local + "> div:last-of-type ").animate({
        opacity: 1,
    }, 1000, function () {
        // Animation complete.
    });
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
    $("body").find(this.local).append("<div class='divBoxItem mdl-color--white mdl-shadow--2dp  col-xs-4 col-sm-3' data-macAddress='" + this.macAddress + "'>" +
            "<img src='" + this.image + "'>" +
            "<p class='text-center'>" + this.nameVendor + "</p>" +
            "<div>" +
            "<p class='text-center'>Power: " + this.Power + "</p>" +
            "<p class='text-center'>Aut: " + this.BSSID + "</p>" +
            "</div>");
};