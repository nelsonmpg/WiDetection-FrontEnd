/* global Backbone */

window.LoginView = Backbone.View.extend({
  iduser: undefined,
  nomeuser: undefined,
  emailuser: undefined,
  logouser: undefined,
  events: {
    "click #btnLogIn": "login"
  },
  getnameuser: function () {
    return this.nomeuser;
  },
  getiduser: function () {
    return this.iduser;
  },
  getlogoUser: function () {
    return this.logouser;
  },
  login: function (e) {
    e.preventDefault();
    var self = this;
    modem('POST', "/login",
            function (data) {
              if (data.length > 0) {
                self.iduser = data[0].id;
                self.nomeuser = data[0].fullname;
                self.emailuser = data[0].email;
                self.logouser = data[0].logo;
                window.localStorage.setItem("Logged", true);
                window.localStorage.setItem("User", $("#login-form > div:nth-child(1) > input").val());

                app.navigate("/Inicio", {
                  trigger: true
                });
              } else {
                app.navigate("", {
                  trigger: true
                });
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              console.log(json.message);

              app.navigate("", {
                trigger: true
              });
            }, {
      "email": $("#login-form input[type='email']").val(),
      "pass": $("#login-form input[type='password']").val()
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
