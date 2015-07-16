var Host = function (local, nome, lat, long, image) {
    this.local = local;
    this.nome = nome;
    this.lat = lat;
    this.long = long;
    this.image = image;
};

Host.prototype.createAndAddToDivHost = function () {
    $("body").find(this.local).append("<div class=' mdl-color--white mdl-shadow--2dp  col-sm-2 col-md-2 col-lg-2'><div class='divAntena'>" +
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