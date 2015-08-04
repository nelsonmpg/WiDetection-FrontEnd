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
