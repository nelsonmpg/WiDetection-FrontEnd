var Host = function (local, nome, lat, long, image) {
    this.local = local;
    this.nome = nome;
    this.lat = lat;
    this.long = long;
    this.image = image;
};

Host.prototype.createAndAddToDivHost = function () {
    $("body").find(this.local).append("<div class='divAntena mdl-color--white mdl-shadow--2dp  col-sm-2 col-md-2 col-lg-2'>" +
            "<img src='" + this.image + "'>" +
            "<p class='text-center'>" + this.nome + "</p>" +
            "<p class='text-center showDispDetail' data-nomeAntena='" + this.nome + "'> Dispositivos: " + "num_host" + "</p>" +
            "<div class='mapOpen' data-nomeAntena='" + this.nome + "' data-lat='" + this.lat + "' data-lon='" + this.long + "'>" +
            "<p class='text-center coordenadas'>lat: " + this.lat + "</p>" +
            "<p class='text-center coordenadas'>lon: " + this.long + "</p>" +
            "</div></div>");
};