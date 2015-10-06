/* global Backbone */
/**
 * 
 * @type @exp;Backbone@pro;View@call;extend 
 * view de criacao de novo utilizador
 */
var NewUserView = Backbone.View.extend({
    events: {
        "click #submit-btn": "newuser",
        "change '#register-form'": "init"
    },
    initialize: function () {
        this.init();
    },
    init: function () {
        (function ($, W, D) {
            var JQUERY4U = {};
            //validacao do formolario de criacao de novo utilizador
            JQUERY4U.UTIL =
                    {
                        setupFormValidation: function ()
                        {
                            //form validation rules
                            $("#register-form").validate({
                                onkeyup: true,
                                onchange: true,
                                rules: {
                                    name: {
                                        required: true,
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
                                    name: "Please enter user's name",
                                    password: {
                                        required: "Please enter user's password",
                                        minlength: "Password must contain at least 5 characters"
                                    },
                                    password2: {
                                        required: "Please enter user's password",
                                        minlength: "Password must contain at least 5 characters",
                                        equalTo: "Please enter the same password"
                                    },
                                    email: "Please enter a valid email address"
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
        if ($("#register-form").valid()) {
            modem('POST', "/NovoUtilizador",
                    function (data) {
                        console.log(data);
                        if (data == false) {
                            $('.my-modal').html($("#avisoLoginFail").html());
                            $(".my-model-hide").css({
                                "dispaly": "block"
                            });
                            $('.my-modal').show();
                            setTimeout(function () {
                                $('.my-modal').hide();
                                $(".my-model-hide").css({
                                    "dispaly": "none"
                                });
                                $('.my-modal').html("");
                            }, 2000);
                        } else {
                              $('.my-modal').html($("#avisoLoginSucess").html());
                            $(".my-model-hide").css({
                                "dispaly": "block"
                            });
                            $('.my-modal').show();
                            setTimeout(function () {
                                $('.my-modal').hide();
                                $(".my-model-hide").css({
                                    "dispaly": "none"
                                });
                                $('.my-modal').html("");
                            }, 2000);
                            
                            
                            //Limpar form
                            $("#register-form").trigger("reset");
                        }

                    },
                    function (xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        console.log(json.message);

                        app.navigate("", {
                            trigger: true
                        });
                    }, {
                "fullname": $("#register-form input[name='name']").val(),
                "email": $("#register-form input[type='email']").val(),
                "pass": stringToMd5(btoa($("#register-form input[name='password']").val()))
            });
        }
    },
    render: function () {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});
