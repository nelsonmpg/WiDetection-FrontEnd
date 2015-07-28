window.templateLoader = {
  load: function(views, callback) {
    async.mapSeries(views, function(view, callbacki) {
      if (window[view] === undefined) {
        console.log('js/views/' + view.replace('View', '').toLowerCase() + '.js');
        $.getScript('js/views/' + view.replace('View', '').toLowerCase() + '.js', function() {
          if (window[view].prototype.template === undefined) {
            console.log('templates/' + view + '.html');
            $.get('templates/' + view + '.html', function(data) {
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
    }, function(error, data) {
      callback();
    });
  }
};

window.modem = function(type, url, sucess, error, data) {
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

