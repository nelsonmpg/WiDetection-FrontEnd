  window.EditProfileView = Backbone.View.extend({
      events: {
          "click #btn-checkLogin": "check",
//        "click #checkLogin button": "check",
          'keyup .error': 'validateField'
      },
      initialize: function () {
          //this.render();
      },
      init: function () {
          $("#checkLogin").show();
          $("#checkLogin > div > div > div > div > img , #img-previewProfile").attr("src", $(".imageuser").attr("src"));


//    modem('GET',
//            "/getProfile/" + window.profile.id,
//                     function (data) {
//                    alert(data);
//                },
//                function (xhr, ajaxOptions, thrownError) {
//                    var json = JSON.parse(xhr.responseText);
//                    error_launch(json.message);
//                }, {}
//        );
      },
      validateField: function (e) {
          $(e.currentTarget).valid();
      },
      check: function (e) {
//        e.stopImmediatePropagation();
          e.preventDefault();

          modem('POST', "/login",
              function (data) {
                  if (data.length > 0) {
                      console.log(data);
                      $("#editProfileDiv").show();
                      $("#checkLogin").hide();
                  } else {
                      showmsg(".my-modal", "error", "Login Checkpoint Failed!... Please Login Again", function () {
                          app.navigate("", {
                              trigger: true
                          });
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
              "email": $("#checkLogin input[type='text']").val(),
              "pass": stringToMd5(btoa($("#checkLogin input[type='password']").val()))
          });

      },
      render: function () {
          var self = this;
          this.setValidator();
          $(this.el).html(this.template());
          return this;
      },
      setValidator: function () {
          $("#checkLogin-form", this.el).validate();
      }
  });
