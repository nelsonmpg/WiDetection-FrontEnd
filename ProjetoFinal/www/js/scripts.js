var graph2Bar, chart, result, mySite;
var loading = '<div class="box box-solid box-loading">' +
        '<div class="box-body">' +
        '</div><!-- /.box-body -->' +
        '<!-- Loading (remove the following to stop the loading)-->' +
        '<div class="overlay">' +
        '<i class="fa fa-refresh fa-spin"></i>' +
        '</div>' +
        '<!-- end loading -->' +
        '</div><!-- /.box -->';
var socket = null;
$(document).ready(function () {

  socket = io.connect(window.location.href);
  // carrega o conteudo do login
  showPageToDiv("section.content", "login.html");
  // evento do click no botao de lkogout
  $("body").on("click", "#logout-btn", function (e) {
    e.preventDefault();
    $('ul.sidebar-menu li.active').removeClass('active');
    showPageToDiv("section.content", "login.html");
  });
  //prevent # links from moving to top
  $("body").on("click", 'a[href="#"][data-top!=true]', function (e) {
    e.preventDefault();
  });
  //para teste,click no bt testar
  $("body").on("click", '#testar', function (e) {
    console.log(this);
    $.ajax({
      type: "GET",
      url: "/getAllTimes/" + socket.id,
      dataType: 'json',
      success: function (data) {
        console.log(data);
        alert(data);
      },
      error: function (error) {
        console.log(JSON.stringify(error));
      }
    });
  });
  // evento de selecionar no menu lateral
  $(".select-item-menu").click(function (e) {
    e.preventDefault();
    if (/*e.which != 1 ||*/ $(this).parent().hasClass('active')) {
      return;
    }

    var $clink = $(this);
    showPageToDiv("section.content", $clink.attr('href'), $clink.data("nome"), $clink.children("i").attr("class"));
    $('ul.sidebar-menu li.active').removeClass('active');
    $clink.parent('li').addClass('active');
  });
  // form login
  $("body").on("submit", "#login-form", function (e) {
    e.preventDefault();
    // simula o clik no dashboard e carrega o conteudo
//    $('a.select-item-menu:first')[0].click();
    $.ajax({
      type: "GET",
      url: "/getAllDataBase",
      dataType: 'json',
      success: function (data) {
        $("section.content").html("");
        var sitesAppend = "";
        for (var i = 0; i < data.length; i++) {
          sitesAppend += '<li class="site-option"><a href="#"><i class="fa fa-circle-o"></i> ' + data[i].db + '</a></li>';
        }
        $('ul.sidebar-menu ul.site-title').append(sitesAppend);
      },
      error: function (error) {
        console.log(JSON.stringify(error));
      }
    });
  });
  // form register
  $("body").on("submit", "#register-form", function (e) {
    e.preventDefault();
    alert("ok");
  });
  // selecao do site pretendido
  $("body").on("click", ".site-option > a", function (e) {
    e.preventDefault();
    $(this).parent().parent().parent("ul > li:first").children("a").children("span").text($(this).text());
    $('ul.sidebar-menu ul.site-title li a i.fa-dot-circle-o').removeClass("fa-dot-circle-o").addClass("fa-circle-o");
    $(this).children().removeClass($(this).children().attr("class")).addClass("fa fa-dot-circle-o");
    $('ul.sidebar-menu ul.site-title li.active').removeClass("active");
    $(this).parent().addClass("active");
    socket.emit("changedatabase", $(this).text().trim());
    mySite = $(this).text().trim();
    $("body > div > aside.main-sidebar > section > ul > li:nth-child(3) > a[href='dashboard.html']").click();
  });
  // ento da perda do servidor
  socket.on('disconnect', function () {
    console.log('Socket disconnected');
  });
  socket.on("updateDisp", function (data, disp, database) {
    if (database == "ProjetoFinal") {
      switch (disp) {
        case "ap":
          if (graph2Bar) {
            graph2Bar.updateNumAp(data);
          }
          break;
        case "disp":
          if (graph2Bar) {
            graph2Bar.updateNumDisp(data);
          }
          break;
      }
    }
  });
  // socket a escuta de incremento de dispositivos na base de dados
  socket.on("newDisp", function (data, local, database) {
    if (database == "ProjetoFinal") {
      switch (local) {
        case "moveis":
          $("body").find("#disp-num-div").html((($("body").find("#disp-num-div").text() * 1) + 1));
          break;
        case "ap":
          $("body").find("#ap-num-div").html((($("body").find("#ap-num-div").text() * 1) + 1));
          break;
        case "sensor":
          $("body").find("#sensores-num-div").html((($("body").find("#sensores-num-div").text() * 1) + 1));
          if (graph2Bar) {
            graph2Bar.updateSensor(data);
          }
          break;
      }
    }
  });
  socket.on('updateChart', function (site, data) {
    console.log("meu:" + mySite + "\t vem:" + site);
    if (mySite == site) {
      data.x = new Date(data.x);
      data.y = data.y * 1;
      chart.options.data[0].dataPoints.push(data);
      chart.options.data[0].dataPoints.shift();
      chart.render();
    }
  });
}); // fim document ready

function showPageToDiv(local, page, nome, icon) {
  $(local).html("");
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
  $("body").find("#chart2bars").html(loading);
  $("body").find("#chart1LineActives").html(loading);
  $("body").find("#chartDispVisit").html(loading);
  $.ajax({
    type: "GET",
    url: "/getNumDispositivos/" + socket.id,
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
    url: "/getAllAntenasAndDisps/" + socket.id,
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
  //------------------------------------------------------------------------------
  $.ajax({
    type: "GET",
    url: "/getAllDisp/" + socket.id,
    dataType: 'json',
    success: function (data) {
      for (var i in data) {
        data[i].x = new Date(data[i].x);
      }
      result = data;
      chart = new CanvasJS.Chart("chart1LineActives", {
        theme: "theme2",
//        title: {
//          text: "Dispositivos Ativos"
//        },
        animationEnabled: true,
        axisX: {
          valueFormatString: "HH:mm"
        },
        axisY: {includeZero: false},
        data: [{
            type: "line",
            lineThickness: 3,
            dataPoints: result
//            //Mostrar Fabricantes no click
//            click: function (e) {
//              $.ajax({
//                type: "GET",
//                url: "/getFabricantesinMin/" + Date(e.dataPoint.x) + "/" + socket.id,
//                dataType: 'json',
//                success: function (data) {
//
//                  console.log(data);
//                },
//                error: function (error) {
//                  console.log(JSON.stringify(error));
//                }
//              });
//              alert(e.dataPoint.x);
//            }
          }]
      });
      chart.render();
    },
    error: function (error) {
      console.log(JSON.stringify(error));
    }
  });
  //---------------------------------------------------------------------------
  //---------------- Gra'fico dos visitas
  //---------------------------------------------------------------------------
  $.ajax({
    type: "GET",
    url: "/getAllTimes/" + socket.id,
    dataType: 'json',
    success: function (data) {
      var arrayToChart = [];
      for (var i in data) {
        arrayToChart.push({label: i, y: data[i].length * 1});
      }
      console.log(arrayToChart);
      var options = {
//		title: {
//			text: "Column Chart using jQuery Plugin"
//		},
        animationEnabled: true,
        data: [{
            type: "bar", //change it to line, area, bar, pie, etc
            click: function (e) { //no click mostrar o fabricante do dispositivo
              $.ajax({
                type: "GET",
                url: "/getNameVendor/"+e.dataPoint.label+"/" + socket.id,
                dataType: 'json',
                success: function (data) {
                  alert(data);
                },
                error: function (error) {
                  console.log(JSON.stringify(error));
                }
              });
              ;
            },
            dataPoints: arrayToChart
          }
        ]
      };
      var countChart = new CanvasJS.Chart("chartDispVisit", options);
      countChart.render()
//	$("body").find("#chartDispVisit").CanvasJSChart(options);
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

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};
Date.prototype.addMinutes = function (h) {
  this.setMinutes(this.getMinutes() + h);
  return this;
};
