/* global CryptoJS, async, _, google */

var stringToMd5 = function (value) {
  return CryptoJS.MD5(value).toString();
};

var getKeyo = function () {
  var ls = localStorage.getItem('keyo');
  var ss = sessionStorage.getItem('keyo');
  return ls || ss;
};

var windowScrollTop = function () {
  $('html, body').stop().animate({
    'scrollTop': 0
  }, 100);
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
  $(local).html('<div class="col-md-8">' +
          '<div class="box box-default">' +
          '<div class="box-body">' +
          '<button type="button" class="close" data-dismiss="alert" onClick="closeAlert(this);" aria-hidden="true"><i class="fa fa-times fa-2x"></i></button>' +
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
  }, 1500);
};

/**
 * Fecha a mensagem de Alert
 * @param {type} local
 * @returns {undefined}
 */
var closeAlert = function (local) {
  $(local).parent().parent().parent().parent().hide();
  $(local).parent().parent().parent().parent().html("");
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

function thumbnail(base64, maxWidth, maxHeight) {
  // Max size for thumbnail
  if (typeof (maxWidth) === 'undefined') {
    var maxWidth = 500;
  }
  if (typeof (maxHeight) === 'undefined') {
    var maxHeight = 500;
  }

  // Create and initialize two canvas
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var canvasCopy = document.createElement("canvas");
  var copyContext = canvasCopy.getContext("2d");

  // Create original image
  var img = new Image();
  img.src = base64;

  // Determine new ratio based on max size
  var ratio = 1;
  if (img.width > maxWidth) {
    ratio = maxWidth / img.width;
  }
  else if (img.height > maxHeight) {
    ratio = maxHeight / img.height;
  }

  // Draw original image in second canvas
  canvasCopy.width = img.width;
  canvasCopy.height = img.height;
  copyContext.drawImage(img, 0, 0);

  // Copy and resize second canvas to first canvas
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL();

}

var carregarmapa = function (local, localaddmap) {
//    alert();
  // Define your locations: HTML content for the info window, latitude, longitude
  //var locations = [['<h4>Bondi Beach</h4>', -33.890542, 151.274856],['<h4>Coogee Beach</h4>', -33.923036, 151.259052],['<h4>Cronulla Beach</h4>', -34.028249, 151.157507],['<h4>Manly Beach</h4>', -33.80010128657071, 151.28747820854187],['<h4>Maroubra Beach</h4>', -33.950198, 151.259302]];
  var locations = local;
  var markers = new Array();
  // Setup the different icons and shadows
  var iconURLPrefix = 'http://maps.google.com/mapfiles/ms/icons/';
  var icons = [
    iconURLPrefix + 'red-dot.png',
    iconURLPrefix + 'green-dot.png',
    iconURLPrefix + 'blue-dot.png',
    iconURLPrefix + 'orange-dot.png',
    iconURLPrefix + 'purple-dot.png',
    iconURLPrefix + 'pink-dot.png',
    iconURLPrefix + 'yellow-dot.png'
  ];
  var iconsLength = icons.length;
  var map = new google.maps.Map(localaddmap, {
    zoom: 18,
    center: new google.maps.LatLng(local[0][1], local[0][2]),
    mapTypeId: google.maps.MapTypeId.ROADMAP, // ROADMAP, HYBRID, SATELLITE, TERRAIN 
    mapTypeControl: true,
    streetViewControl: true,
    panControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM
    }
  });
  var infowindow = new google.maps.InfoWindow({
    maxWidth: 160
  });
  var iconCounter = 5;
  // Add the markers and infowindows to the map
  for (var i = 0; i < locations.length; i++) {
    var icon = icons[iconCounter];
    if (locations[i][3] != null) {
      var now = new Date();
      if (new Date(locations[i][3]) > now.addMinutes(-5)) {
        icon = icons[3];
      } else {
        icon = icons[0];
      }
    }
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: map,
      icon: icon
    });
    markers.push(marker);
    google.maps.event.addListener(marker, 'click', (function (marker, i) {
      return function () {
        infowindow.setContent(locations[i][0]);
        infowindow.open(map, marker);
      };
    })(marker, i));
    iconCounter++;
    // We only have a limited number of possible icon colors, so we may have to restart the counter
    if (iconCounter >= iconsLength) {
      iconCounter = 0;
    }
  }

  google.maps.event.addListener(map, 'click', function (event) {
//    marker.setPosition(event.latLng);
//    var pos = displayCoordinates(event.latLng);
//    map.setCenter(new google.maps.LatLng(pos.lat, pos.long));
//    var geocoder = new google.maps.Geocoder();
//    var latlng = new google.maps.LatLng(pos.lat, pos.long);
//    geocoder.geocode({'location': latlng}, function (results, status) {
//      if (status == google.maps.GeocoderStatus.OK) {
//        if (results[1]) {
//          pos.place = results[1].formatted_address;
//        } else {
//          window.alert('No results found');
//        }
//      } else {
//        window.alert('Geocoder failed due to: ' + status);
//      }
//    });
  });
  return map;
};


var addCircletoMap = function (map, list) {
  for (var item in list) {
    var circleOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: new google.maps.LatLng(list[item].lat, list[item].log),
      radius: Math.sqrt(list[item].value) * 10
    };
    // Add the circle for this city to the map.
    return new google.maps.Circle(circleOptions);
  }
};

var displayCoordinates = function (pnt) {
  var lat = pnt.lat();
  lat = lat.toFixed(4);
  var lng = pnt.lng();
  lng = lng.toFixed(4);
  return {
    lat: lat,
    long: lng,
    place: ""
  };
};

var getColor = function (max, value) {
  var n = value * 100 / max;
  var R = (255 * n) / 100;
  var G = (255 * (100 - n)) / 100;
  var B = 0;
  return rgbToHex(R, G, B);
};


function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

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


Date.prototype.addMinutes = function (m) {
  this.setMinutes(this.getMinutes() + m);
  return this;
};