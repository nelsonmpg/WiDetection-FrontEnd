window.HeaderView = Backbone.View.extend({
  events: {
    "click #logout-btn": "logout",
    "click .sidebar-toggle": "toogleSidebar",
    "click #openopt": "openSidebarOption"
  },
  toogleSidebar: function (e) {
    e.preventDefault();
    $.AdminLTE.pushMenu.activate($(".sidebar-toggle"));
  },
  openSidebarOption: function (e) {
    e.preventDefault();    
   $.AdminLTE.controlSidebar.activate();
  },
  logout: function () {
    window.localStorage.setItem("Logged", false);
    app.navigate("/Login", {
      trigger: true
    });
  },
  initialize: function () {
    this.render();
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});

