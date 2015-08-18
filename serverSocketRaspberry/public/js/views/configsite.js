/* global Backbone, normalizeString, app */

window.ConfigSiteView = Backbone.View.extend({
  location: "http://maps.google.com/maps/api/geocode/json?address=",
  keyloc: "&sensor=false",
  validinifile: false,
  inputchanged: false,
  continue: false,
  events: {
    "click .select-opt-device": "selectDevice",
    "click #create-monitor": "createmonitor",
    "click .select-source": "selectSource",
    "click #save-settings": "savesettings",
    "click #start_monitor": "startmonitor",
    "click #stop-monitor": "stopmonitor",
    "click #Check-Position": "firstposition",
    "click #refresh-values": "refresh",
    "click .btn-modal": "checksave",
    "click #btn_restartSO": "restartso",
    "click #btn_poweroffSO": "poweroffso"
  },
  initialize: function () {
  },
  checkImputs: function () {
    var valid = true;
    $('.valid-input').each(function (i, obj) {
      if ($(obj).val().trim().length <= 2) {
        $(obj).parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        valid = false;
      } else {
        $(obj).parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
      }
      switch ($(obj).data("typevalue")) {
        case "ipaddress":
          var ipRegex = '^([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$';
          if ($(obj).val().trim().match(ipRegex)) {
            $(obj).parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
          } else {
            $(obj).parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
            valid = false;
          }
          break;
        case "port":
          if (($(obj).val().trim() * 1) > 0 && ($(obj).val().trim() * 1) < 65536) {
            $(obj).parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
          } else {
            $(obj).parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
            valid = false;
          }
          break;
      }
    });
    return valid;
  },
  init: function () {
    var self = this;
    $("#server-ip:input").inputmask();
    $('body').on('input', function (e) {
      self.inputchanged = true;
    });
    $('table input').keyup(function () { //  fa-check   fa-close
      self.checkImputs();
    });
    self.checkImputs();
    self.getiniconfigparams();
    self.getwlaninterfaces();
    self.getmonitorcreated();
    self.checkmonitorstarted();
    showInfoMsg(false, '.my-modal');
    $.AdminLTE.boxWidget.activate();
  },
  refresh: function () {
    var self = this;
    showInfoMsg(true, '.my-modal', "RefreshValues.<br>Wait... <i class='fa fa-refresh fa-spin'></i>");
    self.init();
  },
  getiniconfigparams: function () {
    var self = this;
    modem("GET",
            "/paramsinifile",
            function (data) {
              if (data.globalconfig != 0) {
                $("#site-name").val(data.databasesitename);
                $("#site-pass").val(data.databasepass);
                $("#server-ip").val(data.databasehost);
                $("#server-port").val(data.databaseport);
                $("#sensor-local").val(data.localsensormorada);
                $("#sensor-name").val(data.localsensornomeSensor);
                $("#sensor-latitude").val(data.localsensorlatitude);
                $("#sensor-longitude").val(data.localsensorlongitude);
                $("#sensor-posx").val(data.localsensorposx);
                $("#sensor-posy").val(data.localsensorposy);
                carregarmapa([["<h4>" + $("#sensor-name").val() + "</h4>", $("#sensor-latitude").val(), $("#sensor-longitude").val()]], $("#map-google")[0], self.selectnewposition);
                self.validinifile = true;
              } else {
                self.validinifile = false;
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  getwlaninterfaces: function () {
    var self = this;
    modem("GET",
            "/dispOswlan",
            function (data) {
              var a = data.split("\n");
              var displst = "";
              for (var i in a) {
                var b = a[i].split(" ");
                if (b[0].length > 3) {
                  displst += '<li><a class="select-opt-device" data-mac=' + b[1] + ' href="#">' + b[0] + '</a></li>';
                }
              }
              $("#select-device").html(displst);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  getmonitorcreated: function () {
    var self = this;
    modem("GET",
            "/dispOsmon",
            function (data) {
              if (data.length > 0) {
                $("#device-monitor").val(data);
                $("#select-device").parent().children("button").addClass("disabled");
              }
              $('#create-monitor').prop('disabled', true);
              $("#start_monitor").prop('disabled', true);
              $("#stop-monitor").prop('disabled', true);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  selectDevice: function (e) {
    var self = this;
    e.preventDefault();
    $("#device-select").val($(e.currentTarget).text());
    $('#create-monitor').prop('disabled', false);
  },
  createmonitor: function () {
    var self = this;
    console.log("create monitor");
    showInfoMsg(true, '.my-modal', "Create Monitor.<br>Wait... <i class='fa fa-refresh fa-spin'></i>");
    modem("POST",
            "/createmonitor",
            function (data) {
              if (data.toString().trim().length > 2) {
                $("#device-monitor").val(data.toString().replace(/\)/g, ""));
                $("#select-device").parent().children("button").addClass("disabled");
                $('#create-monitor').prop('disabled', true);
                $("#start_monitor").prop('disabled', false);
                showInfoMsg(false, '.my-modal');
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {
      wifi: $("#device-select").val()
    }
    );
  },
  checkmonitorstarted: function () {
    var self = this;
    modem("GET",
            "/checkmonitorstart",
            function (data) {
              if ($("#device-monitor").val().trim().length > 2) {
                if (data.toString().trim().length == 0) {
                  $("#stop-monitor").prop('disabled', true);
                  $("#start_monitor").prop('disabled', false);
                } else {
                  $("#stop-monitor").prop('disabled', false);
                  $("#start_monitor").prop('disabled', true);
                }
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  selectSource: function (e) {
    var self = this;
    e.preventDefault();
    console.log($(e.currentTarget).text());
  },
  selectnewposition: function (data) {
    var self = this;
    $("#sensor-latitude").val(data.lat);
    $("#sensor-longitude").val(data.long);
    $("#sensor-local").val(data.place);
  },
  checksave: function (e) {
    var self = this;
    switch ($(e.currentTarget).data("event")) {
      case"close":
        break;
      case "notsave":
        self.continue = true;
        self.startmonitor();
        break;
      case "save":
        self.inputchanged = false;
        self.continue = true;
        self.savesettings(self.startmonitor());
        break;
    }
    $(".modal").hide();
  },
  savesettings: function (callback) {
    var self = this;
    if (self.checkImputs()) {
      self.inputchanged = false;
      var settings = {
        sitename: $("#site-name").val(),
        host: $("#server-ip").val(),
        port: $("#server-port").val() * 1,
        password: $("#site-pass").val(),
        morada: $("#sensor-local").val(),
        nomeSensor: $("#sensor-name").val(),
        latitude: $("#sensor-latitude").val() * 1,
        longitude: $("#sensor-longitude").val() * 1,
        posx: $("#sensor-posx").val() * 1,
        posy: $("#sensor-posy").val() * 1
      };
      modem("POST",
              "/savesettings",
              function (data) {
                if (data == "save") {
                  showmsg('.my-modal', "success", "Seved Settings!");
                  self.validinifile = true;
                  if (typeof callback == "function") {
                    callback();
                  }
                } else {
                  showmsg('.my-modal', "error", "Error");
                }
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {
        data: settings
      }
      );
    } else {
      showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>.");
    }
  },
  startmonitor: function () {
    var self = this;
    if (self.inputchanged && !self.continue) {
      $(".modal").show();
    } else {
      if (self.validinifile) {
        self.continue = false;
        if ($("#device-monitor").val().trim().length > 0) {
          console.log("start monitor");
          showInfoMsg(true, '.my-modal', "Start Monitor.<br>Wait... <i class='fa fa-refresh fa-spin'></i>");
          modem("POST",
                  "/startmonitor",
                  function (data) {
                    console.log(data);
                    self.confirmMonitorStart();
                  },
                  function (xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                  }, {}
          );
        } else {
          showmsg('.my-modal', "warning", "Create Monitor First!");
        }
      } else {
        showmsg('.my-modal', "warning", "Save Settings First!");
      }
    }
  },
  confirmMonitorStart: function () {
    var self = this;
    setTimeout(function () {
      self.checkmonitorstarted();
      if (!$("#stop-monitor").prop('disabled')) {
        showInfoMsg(false, '.my-modal');
      } else {
        self.confirmMonitorStart();
      }
    }, 1000);
  },
  stopmonitor: function () {
    var self = this;
    console.log("Start stop Monitor!");
    showInfoMsg(true, '.my-modal', "Stop Monitor.<br>Wait... <i class='fa fa-refresh fa-spin'></i>");
    modem("POST",
            "/stopmonitor",
            function (data) {
              self.checkmonitorstarted();
              showInfoMsg(false, '.my-modal');
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  firstposition: function () {
    var self = this;
    $.getJSON(self.location + normalizeString($("#sensor-local").val()).toLowerCase() + self.keyloc, function (data) {
      $("#sensor-local").val(data.results[0].formatted_address);
      $("#sensor-latitude").val(data.results[0].geometry.location.lat);
      $("#sensor-longitude").val(data.results[0].geometry.location.lng);
      self.inputchanged = true;
      carregarmapa([["<h4>" + $("#sensor-name").val() + "</h4>", $("#sensor-latitude").val(), $("#sensor-longitude").val()]], $("#map-google")[0], self.selectnewposition);
    });
  },
  restartso: function () {
    var self = this;
    showInfoMsg(true, '.my-modal', "The system is going down for reboot NOW!<br>Wait for system responding... <i class='fa fa-refresh fa-spin'></i>");
    modem("GET",
            "/restartsystem",
            function (data) {
              setTimeout(function () {
                self.serverResponse();
              }, 10000);
              console.log(data);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  poweroffso: function () {
    var self = this;
    showInfoMsg(true, '.my-modal', "The system is going poweroff NOW!<br>See you latter!");
    modem("GET",
            "/poweroffsystem",
            function (data) {
              console.log(data);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );

  },
  serverResponse: function () {
    var self = this;
    $.ajax({url: window.location.href.split("#")[0],
      type: "HEAD",
      timeout: 1000,
      statusCode: {
        200: function (response) {
          showInfoMsg(false, '.my-modal');
          window.location.reload();
        },
        400: function (response) {
          setTimeout(function () {
            self.serverResponse();
          }, 1000);
          console.log('Not working!');
        },
        0: function (response) {
          setTimeout(function () {
            self.serverResponse();
          }, 1000);
          console.log('Not working!');
        }
      }
    });
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});