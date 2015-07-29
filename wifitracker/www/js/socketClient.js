var socketClient = function (options) {
  var self = this;
  self.vent = options.vent;

  self.hostname = window.location.host.split("#")[0];

  self.connect = function () {
    self.socket = io.connect(self.hostname);
    self.setResponseListeners(self.socket);
    
  };

  self.setSite = function (site) {
    self.socket.emit("changesite", site);
  };

  self.setResponseListeners = function (socket) {

    // ento da perda do servidor
    socket.on('disconnect', function () {
      console.log('Socket disconnected');
    });

    socket.on("updateDisp", function (data, disp, database) {
      console.log(data);
//      if (database == "ProjetoFinal") {
//        switch (disp) {
//          case "ap":
//            if (graph2Bar) {
//              graph2Bar.updateNumAp(data);
//            }
//            break;
//          case "disp":
//            if (graph2Bar) {
//              graph2Bar.updateNumDisp(data);
//            }
//            break;
//        }
//      }
    });
    // socket a escuta de incremento de dispositivos na base de dados
    socket.on("newDisp", function (data, local, database) {
      console.log(data);
//      if (database == "ProjetoFinal") {
//        switch (local) {
//          case "moveis":
//            $("body").find("#disp-num-div").html((($("body").find("#disp-num-div").text() * 1) + 1));
//            break;
//          case "ap":
//            $("body").find("#ap-num-div").html((($("body").find("#ap-num-div").text() * 1) + 1));
//            break;
//          case "sensor":
//            $("body").find("#sensores-num-div").html((($("body").find("#sensores-num-div").text() * 1) + 1));
//            if (graph2Bar) {
//              graph2Bar.updateSensor(data);
//            }
//            break;
//        }
//      }
    });
    socket.on('updateChart', function (site, data) {
      console.log(site);
//      console.log("meu:" + mySite + "\t vem:" + site);
//      if (mySite == site) {
//        data.x = new Date(data.x);
//        data.y = data.y * 1;
//        chart.options.data[0].dataPoints.push(data);
//        chart.options.data[0].dataPoints.shift();
//        chart.render();
//      }
    });

  };
};