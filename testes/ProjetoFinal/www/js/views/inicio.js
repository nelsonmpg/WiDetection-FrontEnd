window.Inicio = Backbone.View.extend({
  events: {
    "click a": "alert",
    "click #logout-btn":"logout"
  },
  alert: function (e) {
    e.preventDefault();
    app.navigate("/Next", {
      trigger: true
    });
  },
  logout: function(){
    window.localStorage.setItem("Logged", false);
    app.navigate("/Login", {
      trigger: true
    });
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
