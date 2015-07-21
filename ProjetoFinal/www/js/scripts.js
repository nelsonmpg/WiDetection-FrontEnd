var graph2Bar;

$(document).ready(function () {
  var socket = io.connect(window.location.href);


  // carrega o conteudo do login
  showPageToDiv("section.content", "login.html");

  $("body").one("click", "#logout-btn", function (e) {
    e.preventDefault();
    $('ul.sidebar-menu li.active').removeClass('active');
    showPageToDiv("section.content", "login.html");
  });

  //prevent # links from moving to top
  $("body").on("click", 'a[href="#"][data-top!=true]', function (e) {
    e.preventDefault();
  });

  $(".select-item-menu").click(function (e) {
    e.preventDefault();
    if (e.which != 1 || $(this).parent().hasClass('active')) {
      return;
    }

    var $clink = $(this);
    showPageToDiv("section.content", $clink.attr('href'), $clink.data("nome"), $clink.children("i").attr("class"));
    $('ul.sidebar-menu li.active').removeClass('active');
    $clink.parent('li').addClass('active');
  });

  // formdo login
  $("body").on("submit", "#login-form", function (e) {
    e.preventDefault();
    $("section.content").html("");


    // simula o clik no dashboard e carrega o conteudo
    $('a.select-item-menu:first')[0].click();

  });

  $("body").on("submit", "#register-form", function (e) {
    e.preventDefault();
    alert("ok");
  });

  socket.on('disconnect', function () {
    console.log('Socket disconnected');
  });

  socket.on("newDisp", function (data, local) {
    
    switch (local) {
      case "moveis":
        $("body").find("#disp-num-div").html(data);
        if (graph2Bar) {
          graph2Bar.updateNumDisp(data);
        }
        break;
      case "ap":
        $("body").find("#ap-num-div").html(data);
        if (graph2Bar) {
          graph2Bar.updateNumAp(data);
        }
        break;
      case "sensor":
        $("body").find("#sensores-num-div").html(data);
        break;
    }
  });


});

function showPageToDiv(local, page, nome, icon) {
  $.ajax({
    method: 'GET',
    url: "./html/" + page,
    cache: false, dataType: "text",
    success: function (data) {
      $(local).html(data);
      $(".nome-separador").html(nome);
      var i_elem = $("section.content-header > ol.breadcrumb > li > a > i:first");
      i_elem.removeClass(i_elem.attr("class")).addClass(icon);
      $.AdminLTE.boxWidget.activate();

      switch (page) {
        case "dashboard.html":
          carregarDashBoard();
          break;
        case "":
          break;
      }
    },
    error: function (err) {
      alert("error " + err);
    },
    complete: function () {
      //alert("finished");
    }
  });
}

function carregarDashBoard() {
  $.ajax({
    type: "GET",
    url: "/getNumDispositivos",
    dataType: 'json',
    success: function (data) {
      $("body").find("#sensores-num-div").html(data.sensor);
      $("body").find("#disp-num-div").html(data.moveis);
      $("body").find("#ap-num-div").html(data.ap);
    },
    error: function (error) {
      console.log(JSON.stringify(error));
    }
  });

  $.ajax({
    type: "GET",
    url: "/getAllAntenasAndDisps",
    dataType: 'json',
    success: function (data) {
      graph2Bar = new ArrayToGraph(data, "Quantidade de Dispositivos / Sensor", "", "chart2bars", "column");

      // para aparecer a div com os resultados
      graph2Bar.createArrayToGraphTwoBar();
    },
    error: function (error) {
      console.log(JSON.stringify(error));
    }
  });
}

function criarLightBox(divNome) {
  $("body").append("<div id='hover'></div>");
  $("body").append("<div id='popup'><div id='" + divNome + "' class='esticar-vertical'></div><div id='close'>X</div></div>");
}

/**
 * Passar uma data new Date("15/07/2015") e devolvolve um array com os MacAddress Ativos desde essa data
 * @param {type} date
 * @returns {Array|getMACAfterDate.entrou}
 */
function getMACAfterDate(date) {
  var entrou = [];
  for (var i in teste) {
    for (var e in teste[i].sensores) {
      for (var r in teste[i].sensores[e].values) {
        if (new Date(teste[i].sensores[e].values[r].Last_time > date)) {
          entrou.push(teste[i].macAddress);
          break;
        }
      }
    }
  }
  return entrou;
}



/**
 * Passar uma data new Date("15/07/2015") e devolvolve um array com os MacAddress Ativos nessa data
 * @param {type} date
 * @returns {Array|getMACAfterDate.entrou}
 */
function getMACInDate(date) {
  var entrou = [];
  for (var i in teste) {
    for (var e in teste[i].sensores) {
      for (var r in teste[i].sensores[e].values) {
        var find = new Date(teste[i].sensores[e].values[r].Last_time);
        if (find.getDate() == date.getDate() && find.getFullYear() == date.getFullYear() && find.getHours() == date.getHours() && find.getMonth() == date.getMonth() && find.getMinutes() == date.getMinutes()) {
          entrou.push(teste[i].macAddress);
          break;
        }
      }
    }
  }
  return entrou;
}


/**
 * Faz uma contagem dos MAC no min da hora passada até ao atual
 * @param {type} date
 * @returns {Array|makeCountFrom.result}
 */
function makeCountFrom(date) {
  var result = [];
  while (date < new Date().addMinutes(-1)) {
    result.push({x: new Date(date), y: (getMACInDate(date)).length});
    date.addMinutes(1);
  }

  criarLightBox("ativos");


  var chart = new CanvasJS.Chart("ativos",
          {
            theme: "theme2",
            title: {
              text: "Dispositivos Ativos"
            },
            animationEnabled: true,
            axisX: {
              valueFormatString: "H:mm:ss",
            },
            axisY: {includeZero: false},
            data: [
              {
                type: "line",
                //lineThickness: 3,        
                dataPoints: result
              }


            ]
          });

  chart.render();

  return result;
}

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

Date.prototype.addMinutes = function (h) {
  this.setMinutes(this.getMinutes() + h);
  return this;
};
