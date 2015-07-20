var graph2Bar;

$(document).ready(function () {
  var socket = null;

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

    // inicia a ligacao do web-socket
    socket = io.connect(window.location.href);

    // simula o clik no dashboard e carrega o conteudo
    $('a.select-item-menu:first')[0].click();

  });

  $("body").on("submit", "#register-form", function (e) {
    e.preventDefault();
    alert("ok");
  });


  // verifica se o web-spcket e valido
  if (socket) {

    alert("asd");
  }


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