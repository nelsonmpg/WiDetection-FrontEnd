window.LoginView = Backbone.View.extend({
  events: {
    "click #btnLogIn": "login"
  },
  login: function (e) {
    e.preventDefault();
    window.localStorage.setItem("Logged", true);
    window.localStorage.setItem("User", $("#login-form > div:nth-child(1) > input").val());

    app.navigate("/InicioView", {
      trigger: true
    });

  },
  initialize: function () {
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
