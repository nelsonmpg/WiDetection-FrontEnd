/* global Backbone, app */

window.HeaderView = Backbone.View.extend({
  nameuser: "",
  logotipo: "",
  initialize: function (opt) {
    this.nameuser = opt.name;
    this.logotipo = opt.logo;
  },
  events: {
    "click #logout-btn": "logout",
    "click .sidebar-toggle": "toogleSidebar",
    "click #openopt": "openSidebarOption",
    "click #newuser-btn": "newUser"
  },
  init: function () {
    $(".nameuser").text(this.nameuser);
    $(".imageuser").attr("src", this.logotipo);
    $.AdminLTE.controlSidebar.activate();
    $.AdminLTE.pushMenu.activate($(".sidebar-toggle"));
  },
  toogleSidebar: function (e) {
    e.preventDefault();
  },
  openSidebarOption: function (e) {
    e.preventDefault();
  },
  newUser: function (e) {
    e.preventDefault();
    app.navigate("NovoUtilizador", {
      trigger: true
    });
  },
  logout: function () {
    window.localStorage.setItem("Logged", false);
    app.navigate("", {
      trigger: true
    });
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});

