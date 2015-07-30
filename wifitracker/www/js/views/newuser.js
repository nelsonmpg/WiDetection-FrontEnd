/* global Backbone */

var NewUserView = Backbone.View.extend({
  events: {
    "click #submit-btn": "newuser"
  },
  initialize: function () {
    this.init();
  },
  init: function (){
    (function ($, W, D){
      var JQUERY4U = {};

      JQUERY4U.UTIL =
              {
                setupFormValidation: function ()
                {
                  //form validation rules
                  $("#register-form").validate({
                    rules: {
                      name: "required",
                      email: {
                        required: true,
                        email: true
                      },
                      password: {
                        required: true,
                        minlength: 5
                      },
                      agree: "required"
                    },
                    messages: {
                      firstname: "Por favor insira o nome do utilizador",
                      password: {
                        required: "Por favor insira uma password",
                        minlength: "A password deve conter, pelo menos, 5 caracteres"
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
