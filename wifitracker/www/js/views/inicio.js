window.InicioView = Backbone.View.extend({
  events: {
  },
  initialize: function () {
  },
  render: function () {
    var self = this;
    var controlo = window.localStorage.getItem("Logged");
    var user = window.localStorage.getItem("User");
    if (controlo){
      $(this.el).html(this.template());
    return this;
  } else {
     $(this.el).html("Não está logado");
    return this;
  }
}
});
