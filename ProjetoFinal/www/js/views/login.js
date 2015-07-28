window.LoginView = Backbone.View.extend({
  events: {
    'submit': 'loginuser'//,
//    'click .recoverpass': 'recoverpass'
  },
//  recoverpass: function () {
//    //user/:user/recover
//    modem('POST', 'user/' + $('#emailfp').val() + '/recover',
//            function (json) {
//              alert('Email was sent with recovery instructions');
//            },
//            function (xhr, ajaxOptions, thrownError) {
//              var json = JSON.parse(xhr.responseText);
//              console.log(json);
//            }
//    );
//  },
  log: function (json) {
    console.log(json);
    window.profile = new Profile();
    window.profile.fetch(json, function () {
      window.logged = true;
    }, function () {
      alert('Login failed');
    });

  },
  loginuser: function () {
    var self = this;

    var user = $('input[type=email]').val();
    var password = $('input[type=password]').val();

    var credential = user + ':' + password;

//    if ($("#rememberme").is(':checked')) {
//      localStorage.setItem('keyo', btoa(credential));
//    } else {
//      sessionStorage.setItem('keyo', btoa(credential));
//    }


    modem('POST', '/login', function (json) {
      self.log(json);
    },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              console.log(json);
            }
    );
  },
  render: function () {
    $(this.el).html(this.template());
//    this.getlogo();
    return this;
  }

});