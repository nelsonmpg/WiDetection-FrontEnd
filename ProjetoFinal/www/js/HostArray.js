var HostArray = function (local, arrayHosts) {
    this.local = local;
    this.arrayHosts = arrayHosts;
    this.image;
};

HostArray.prototype.setImage = function (img) {
    switch (img) {
        case 0:
            this.image = "./images/antena.png";
            break;
        case 0:
            this.image = "";
            break;
        case 0:
            this.image = "";
            break;
    }
};

HostArray.prototype.listaHost = function () {
    $("body").find(this.local).html("");
    for (var i = 0; i < this.arrayHosts.length; i++) {
        $("body").find(this.local).append("<div class='divAntena mdl-color--white mdl-shadow--2dp  col-sm-2 col-md-2 col-lg-2'>" +
                "<img src='" + this.image + "'>" +
                "<p class='text-center'>" + this.arrayHosts[i].nomeAntena + "</p>" +
                "<p class='text-center showDispDetail' data-nomeAntena='" + this.arrayHosts[i].nomeAntena + "'> Dispositivos: " + "num_host" + "</p>" +
                "<div class='mapOpen' data-nomeAntena='" + this.arrayHosts[i].nomeAntena + "' data-lat='" + this.arrayHosts[i].latitude + "' data-lon='" + this.arrayHosts[i].longitude + "'>" +
                "<p class='text-center coordenadas'>lat: " + this.arrayHosts[i].latitude + "</p>" +
                "<p class='text-center coordenadas'>lon: " + this.arrayHosts[i].longitude + "</p>" +
                "</div></div>");
    }
    if (this.arrayHosts.length == 0) {
        $("#divAntenas").append("<div class='jumbotron'><h2>N&atilde;o existem antenas ativas de momento</h2></div>");
    }
};