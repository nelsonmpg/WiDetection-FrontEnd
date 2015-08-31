window.ContentNavView = Backbone.View.extend({
  events: {
    "click a": function (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  initialize: function () {
    //this.render();
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  },
  setView: function (viewName) {
    $(".atualView").text(viewName);
    $(".mapSite li.active").html("<a href='#'>" + viewName + "</a>");
  }
});
