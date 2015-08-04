  /* global CryptoJS, async, _ */

  var stringToMd5 = function (value) {
      return CryptoJS.MD5(value).toString();
  };

  var getKeyo = function () {
      var ls = localStorage.getItem('keyo');
      var ss = sessionStorage.getItem('keyo');
      console.log(ls, ss);
      return ls || ss;
  };

  window.templateLoader = {
      load: function (views, callback) {
          async.mapSeries(views, function (view, callbacki) {
              if (window[view] === undefined) {
                  $.getScript('js/views/' + view.replace('View', '').toLowerCase() + '.js', function () {
                      if (window[view].prototype.template === undefined) {
                          $.get('templates/' + view + '.html', function (data) {
                              window[view].prototype.template = _.template(data);
                              callbacki();
                          }, 'html');
                      } else {
                          callbacki();
                      }
                  });
              } else {
                  callbacki();
              }
          }, function (error, data) {
              callback();
          });
      }
  };

  var showmsg = function (local, tipo, msg, callback) {
      var formsg = {
          class: "",
          icon: "",
          titulo: ""
      };
      switch (tipo) {
          case "success":
              formsg = {
                  class: "alert-success",
                  icon: "fa-check",
                  titulo: "Success!"
              };
              break;
          case "error":
              formsg = {
                  class: "alert-error",
                  icon: "fa-ban",
                  titulo: "Error"
              };
              break;
          case "warning":
              formsg = {
                  class: "alert-warning",
                  icon: "fa-warning",
                  titulo: "Warning"
              };
              break;
      }
      $("body").animate({
          scrollTop: 0
      });
      $(local).html('<div class="col-md-8">' +
          '<div class="box box-default">' +
          '<div class="box-body">' +
          '<div class="alert ' + formsg.class + ' alert-dismissable">' +
          '<h3><i class="icon fa ' + formsg.icon + '"></i> ' + formsg.titulo + '</h3>' +
          '<h4>' + msg + '</h4>' +
          '</div></div></div></div>');
      $(local).show();
      setTimeout(function () {
          $(local).hide();
          $(local).html("");
          if (callback) {
              callback();
          }
      }, 3000);
  };

  var showInfoMsg = function (show, local, msg) {
      var formsg = {
          class: "alert-info",
          icon: "fa-info",
          titulo: "Info"
      };

      $("body").animate({
          scrollTop: 0
      });
      if (show) {
          $(local).html('<div class="col-md-8">' +
              '<div class="box box-default">' +
              '<div class="box-body">' +
              '<div class="alert ' + formsg.class + ' alert-dismissable">' +
              '<h3><i class="icon fa ' + formsg.icon + '"></i> ' + formsg.titulo + '</h3>' +
              '<h4>' + msg + '</h4>' +
              '</div></div></div></div>');
          $(local).show();
      } else {
          $(local).hide();
          $(local).html("");
      }
  };

  window.modem = function (type, url, sucess, error, data) {
      $.ajax({
          async: true,
          cache: false,
          type: type || 'GET',
          url: url,
          dataType: 'json',
          data: data,
          success: sucess,
          error: error
      });
  };
