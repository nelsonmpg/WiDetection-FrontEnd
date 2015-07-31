/* global Backbone */

var NewUserView = Backbone.View.extend({
  events: {
    "click #submit-btn": "newuser",
    "change '#register-form input'":"init"
  },
  initialize: function () {
    this.init();
  },
  init: function () {
    (function ($, W, D) {
      var JQUERY4U = {};

      JQUERY4U.UTIL =
              {
                setupFormValidation: function ()
                {
                  //form validation rules
                  $("#register-form").validate({
                    onkeyup: true,
                    onchange:true,
                    rules: {
                      name: {
                        required:true,
                        minlength: 3
                      },
                      email: {
                        required: true,
                        email: true
                      },
                      password: {
                        required: true,
                        minlength: 5
                      },
                      password2: {
                        required: true,
                        minlength: 5,
                        equalTo: "#password"
                      }
                    },
                    messages: {
                      name: "Por favor insira o nome do utilizador",
                      password: {
                        required: "Por favor insira uma password",
                        minlength: "A password deve conter, pelo menos, 5 caracteres"
                      },
                       password2: {
                        required: "Por favor insira a mesma password",
                        minlength: "A password deve conter, pelo menos, 5 caracteres",
                        equalTo: "Por favor insira a mesma password"
                      },
                      email: "Por favor insira um email válido"
                    },
                    submitHandler: function (form) {
                      form.submit();
                    }
                  });
                }
              }

      //when the dom has loaded setup form validation rules
      $(D).ready(function ($) {
        JQUERY4U.UTIL.setupFormValidation();
      });

    })(jQuery, window, document);

  },
  newuser: function (e) {
    e.preventDefault();
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
