var socketClient = function (options) {
  var self = this;
  var tryreconnect = false;
  self.vent = options.vent;

  self.hostname = window.location.host.split("#")[0];

  self.connect = function () {

    if (typeof self.socket == "undefined") {
      self.socket = io.connect(self.hostname);
      self.setResponseListeners(self.socket);

    } else if (tryreconnect) {
      tryreconnect = false;
      self.socket.io.open();
      self.setResponseListeners(self.socket);
    }

  };

  self.disconnect = function () {
    if (self.socket) {//socket.io.close();
      self.socket.io.close();
    }
  };

  self.setuserid = function (idd) {
    self.socket.emit("userid", idd);
  };

  self.setSite = function (id, site) {
    self.socket.emit("changesite", id, site);
    window.profile.site = site;
  };

  self.getAllDisp = function (id) {
    self.socket.emit("getAllDisp", id);
  };

  self.setResponseListeners = function (socket) {

    // ento da perda do servidor
    socket.on('disconnect', function () {
      tryreconnect = true;
      console.log('Socket disconnected');
    });

    socket.on("getAllDisp", function (data, site) {
      self.vent.trigger("getAllDisp", data, site);
    });
        
    socket.on("updateChart", function (x, site) {
      self.vent.trigger("updateChart", x, site);
    });

    // socket a escuta de incremento de dispositivos na base de dados
    socket.on("newDisp", function (data, local, site) {
      self.vent.trigger("newDisp", data, local, site);
    });

    // socket a escuta da atualizacao do power dos dispositivos
    socket.on("updateRealTimeChart", function (data, local, site) {
      self.vent.trigger("updateRealTimeChart", data, local, site);
    });
    
    // socket a escuta de atualizacao do estado do sensor
    socket.on("changeActiveAnt", function (data, site) {
      self.vent.trigger("changeActiveAnt", data, site);
    });
    
    // socket a escuta de atualizacao do estado do sensor
//    socket.on("updateCharTwoBars", function (data, local, site) {
//      self.vent.trigger("updateCharTwoBars", data, local, site);
//    });    
  };
};