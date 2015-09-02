self.onmessage = function (e) {
  var teste = [];
  var output = e.data;
  for (var a in output) {
    teste[output[a].macAddress] = {
      macAddress: output[a].macAddress,
      nameVendor: output[a].nameVendor
    };
    teste[output[a].macAddress].sensores = [];
    for (var b  in output[a].disp) {
      teste[output[a].macAddress].sensores.push({
        name: output[a].disp[b].name,
        values: output[a].disp[b].values});
    }
  }

  Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
  };

  Date.prototype.addMinutes = function (m) {
    this.setMinutes(this.getMinutes() + m);
    return this;
  };

  var result = {};
  var ini, fin;
  
  for (var a in teste) {
    for (var b in teste[a].sensores) {
      ini = new Date(teste[a].sensores[b].values[0].Last_time*1000);
      fin = ini;
      for (var c in teste[a].sensores[b].values) {
        var sensorLastTime = new Date(teste[a].sensores[b].values[c].Last_time*1000);
        if (sensorLastTime > fin) {
          if (sensorLastTime < fin.addMinutes(5)) {
            fin = sensorLastTime;
          } else {
            if (typeof result[teste[a].macAddress] == "undefined" ) {
            result[teste[a].macAddress] = [];
            }
            var x = {"sensor": teste[a].sensores[b].name, "inicio": ini, "fim": fin};
            result[teste[a].macAddress].push(x);
            //console.log(result[teste[a].macAddress]);
//            self.postMessage({"macAddress":teste[a].macAddress,"visita":x,"nameVendor":teste[a].nameVendor});
            ini = sensorLastTime;
            fin = ini;
          }
        }
      }
    }
  }
 
  self.postMessage(result);
};