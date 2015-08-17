window.EditProfileView = Backbone.View.extend({
    events: {
        "click #btn-checkLogin": "check",
        'keyup .error': 'validateField',
        'click #submitProfile': 'submitProfile',
        'dragenter .converteFiles': function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(e.currentTarget).css({
                'border': '2px solid #0B85A1',
                "-webkit-box-shadow": "5px 5px 2px #888888",
                "-moz-box-shadow": "5px 5px 2px #888888",
                "box-shadow": "5px 5px 2px #888888"
            });
        },
        'dragleave .converteFiles': function (e) {
            $(e.currentTarget).css({
                'border': '2px dotted #0B85A1',
                "-webkit-box-shadow": "2px 2px 1px #888888",
                "-moz-box-shadow": "2px 2px 1px #888888",
                "box-shadow": "2px 2px 1px #888888"
            });
        },
        'drop .converteFiles': 'image3',
        'dragover .converteFiles': function (e) {
            e.stopPropagation();
            e.preventDefault();
        },
        "click .converteFiles": function (e) {
            $(e.currentTarget).prev($("input[type=file]").click());
        },
        'change input[type=file]': "image2"
    },
    initialize: function () {
        //this.render();
    },
    init: function () {
        var self = this;
        $("#checkLogin").show();
        $("#checkLogin > div > div > div > div > img , #img-previewProfile").attr("src", $(".imageuser").attr("src"));

        // carregar os valores antigos no form
        $("#newemail").val(window.profile.get("email"));
        $("#newfullname").val(window.profile.get("name"));

        (function ($, W, D) {
            var JQUERY4U = {};

            JQUERY4U.UTIL =
                    {
                        setupFormValidation: function ()
                        {
                            //form validation rules
                            $("#formPro").validate({
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
                                        equalTo: "#newpass"
                                    }
                                },
                                messages: {
                                    name: "Insert a username, please",
                                    password: {
                                        required: "Insert a password, please",
                                        minlength: "A password deve conter, pelo menos, 5 caracteres"
                                    },
                                    password2: {
                                        required: "Insert the same password, please",
                                        minlength: "A password deve conter, pelo menos, 5 caracteres",
                                        equalTo: "Por favor insira a mesma password"
                                    },
                                    email: "Por favor insira um email válido"
                                },
                                submitHandler: function () {
                                    //self.submitProfile();
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
    image2: function (e) {
        var file = e.originalEvent.target.files[0];
        var reader = new FileReader(file);
        reader.onload = function (evt) {
            $('#img-previewProfile').attr('src', thumbnail(evt.target.result, 70, 70));
        };
        reader.readAsDataURL(file);
    },
    image3: function (e) {
        $(e.currentTarget).css({
            'border': '2px dotted #0B85A1',
            "-webkit-box-shadow": "2px 2px 1px #888888",
            "-moz-box-shadow": "2px 2px 1px #888888",
            "box-shadow": "2px 2px 1px #888888"
        });
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        var errMessage = 0;
        $.each(files, function (index, file) {
            // Some error messaging
            if (!files[index].type.match('image.*')) {
                if (errMessage === 0) {
                    alert('Hey! Images only');
                    ++errMessage
                }
                else if (errMessage === 1) {
                    alert('Stop it! Images only!');
                    ++errMessage
                }
                else if (errMessage === 2) {
                    alert("Can't you read?! Images only!");
                    ++errMessage
                }
                else if (errMessage === 3) {
                    alert("Fine! Keep dropping non-images.");
                    errMessage = 0;
                }
                return false;
            }
            var reader = new FileReader(file);
            reader.onload = function (evt) {
                $('#img-previewProfile').attr('src', thumbnail(evt.target.result, 70, 70));
            };
            reader.readAsDataURL(file);
        });
    },
    validateField: function (e) {
        $(e.currentTarget).valid();
    },
    submitProfile: function () {
        modem('POST', "/updateprofile",
                function (data) {
                    console.log(data);
                    if (data.length > 0) {
                        showmsg(".my-modal", "info", "Account updated!...<br>Please Login Again.", function () {
                                app.navigate("", {
                                    trigger: true
                                });
                        });
                    } else {
                        showmsg(".my-modal", "error", "Something wrong!...<br>This email already existes in database.", function () {
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
            "fullname": $("#newfullname").val(),
            "newEmail": $("#newemail").val(),
            "oldEmail": window.profile.get("email"),
            "img": $("#img-previewProfile").attr("src"),
            "email": $("#newemail").val(),
            "pass": stringToMd5(btoa($("#newpass").val())),
            "id":window.profile.id
        });


    },
    check: function (e) {
        e.preventDefault();
        modem('POST', "/login",
                function (data) {
                    if (data.length > 0) {
                        $("#editProfileDiv").show();
                        $("#checkLogin").hide();
                    } else {
                        showmsg(".my-modal", "error", "Login Checkpoint Failed!...<br>Please Login Again.", function () {
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
        $("#formPro", this.el).validate();
    }
});
