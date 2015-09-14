/* global Backbone, app */

window.SideBarView = Backbone.View.extend({
  databaseselect: false,
  lastsite: "",
  socketsidebar: null,
  events: {
    "click .site-option": "select_site",
    "click #site-ativo": function (e) {
      e.preventDefault();
      $('ul.sidebar-menu li.active').removeClass("active");
      $(e.currentTarget).parent().addClass("active");
    },
    "click .select-item-menu": "navsidebar"
  },
  resetValues: function () {
    var self = this;
    window.profile.set("site", undefined);
    self.databaseselect = false;
    self.lastsite = "";
  },
  select_site: function (e) {
    var self = this;
    e.preventDefault();
    if (self.lastsite != $(e.currentTarget).text()) {
      window.profile.set({"site": $(e.currentTarget).text().trim()});
      self.socketsidebar.setSite(window.profile.id, $(e.currentTarget).text().trim());
      self.lastsite = $(e.currentTarget).text();
      $(e.currentTarget).parent().parent("ul > li:first").children("a").children("p").text($(e.currentTarget).text());
      $(e.currentTarget).parent().parent("ul > li:first").children("a").children("p").css("visibility", "visible");
      $('ul.sidebar-menu ul.site-title li a i.fa-dot-circle-o').removeClass("fa-dot-circle-o").addClass("fa-circle-o");
      $(e.currentTarget).children().children().removeClass($(e.currentTarget).children().attr("class")).addClass("fa fa-dot-circle-o");

      $("#site-ativo .fa-angle-left").click();

      $('ul.sidebar-menu li.active').removeClass("active");
      $('ul.sidebar-menu li.select-site-first').children('a[data-nome="Dashboard"]').parent().addClass("active");
      app.navigate("Dashboard", {
        trigger: true
      });
      if (self.databaseselect) {
        Backbone.history.stop();
        Backbone.history.start();
      }
      self.databaseselect = true;
    }
  },
  navsidebar: function (e) {
    var self = this;
    e.preventDefault();
    if ($(e.currentTarget).parent().hasClass("select-site-first")) {
      if (typeof window.profile.get("site") != "undefined" && self.databaseselect) {
        if ($(e.currentTarget).parent().parent().parent().hasClass("treeview")) {
          $('ul.sidebar-menu li ul li.active').removeClass("active");
          $(e.currentTarget).parent().addClass("active");
        } else {
          $("li.active .fa-angle-left").click();
          $('ul.sidebar-menu li.active').removeClass("active");
          $(e.currentTarget).parent().addClass("active");
        }
        app.navigate($(e.currentTarget).data("nome"), {
          trigger: true
        });
      } else {
        showmsg('.my-modal', "warning", "Select a site first.<br>To continue.");
      }
    } else {
      $("li.active .fa-angle-left").click();
      $('ul.sidebar-menu li.active').removeClass("active");
      $(e.currentTarget).parent().addClass("active");
      app.navigate($(e.currentTarget).data("nome"), {
        trigger: true
      });
    }

  },
  setActive: function (nav) {
    $(".select-site-first a span:contains('" + nav + "')").click();
  },
  setDetailSensor: function (nav) {
    $(".select-site-first a[data-nome='Detail']").parent().parent().parent().children("a:first").click();
    setTimeout(function () {
      $(".select-site-first a span:contains('" + nav + "')").click();
    }, 1000);
  },
  selectadmin: function () {
    $('li a[data-nome="AdminSites"].select-item-menu').click();
    $(".showitem").css({
      "display": "none"
    });
  },
  removeActive: function () {
    $("li.active .fa-angle-left").click();
    $('ul.sidebar-menu li.active').removeClass("active");
  },
  initialize: function (opt) {
    this.socketsidebar = opt.socket;
    $(".showitem").css({
      "display": "block"
    });
  },
  addsitessidebar: function () {
    if (!self.databaseselect) {
      modem('GET', "/getAllDataBase",
              function (data) {
                var sitesAppend = "";
                for (var i = 0; i < data.length; i++) {
                  sitesAppend += '<li class="site-option"><a href="#"><i class="fa fa-circle-o"></i> ' + data[i].db + '</a></li>';
                }
                $('ul.sidebar-menu ul.site-title').html(sitesAppend);
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {}
      );
    }
    $.AdminLTE.tree(".sidebar");
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
