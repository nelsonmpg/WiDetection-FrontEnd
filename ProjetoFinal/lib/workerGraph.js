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



  var result = [];

  Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
  };

  Date.prototype.addMinutes = function (m) {
    this.setMinutes(this.getMinutes() + m);
    return this;
  };

Date.prototype.addSeconds = function (s) {
    this.setSeconds(this.getSeconds() + s);
    return this;
  };

  var date = new Date().addHours(-1);
  date.setSeconds(0);

  while (date < new Date().addMinutes(-1)) {
    result.push({x: new Date(date), y: (getMACInDate(date)).length});
    date.addMinutes(1);
  }

  self.postMessage(result);


  /**
   * Passar uma data new Date("15/07/2015") e devolvolve um array com os MacAddress Ativos nessa data
   * @param {type} date
   * @returns {Array|getMACAfterDate.entrou}
   */
  function getMACInDate(date) {
    var entrou = [];
    for (var i in teste) {// Percorre todo o  array
        var s = false;
      for (var e in teste[i].sensores) { // Percorre todo os sensores 
        for (var r in teste[i].sensores[e].values) { // Percorre Todos os values
          var find = new Date(teste[i].sensores[e].values[r].Last_time);
          find.setSeconds(0);
          if (find.getDate() == date.getDate() && find.getFullYear() == date.getFullYear() && find.getHours() == date.getHours() && find.getMonth() == date.getMonth() && find.getMinutes() == date.getMinutes()) {
            entrou.push({mac: teste[i].macAddress, vendor: teste[i].nameVendor});
            teste[i].sensores[e].values.splice(r,1);
            s = true;
            break;
          }
        }
        if (s) break;
      }
    }
    return entrou;
  }
};