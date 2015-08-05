  window.EditProfileView = Backbone.View.extend({
      events: {
          "click #btn-checkLogin": "check",
//        "click #checkLogin button": "check",
          'keyup .error': 'validateField'//,
//          "dragover .converteFiles": "image",
//          "click .converteFiles": "image",
//          'change input[type=file]': "image2"
      },
      initialize: function () {
          //this.render();
      },
      init: function () {
          $("#checkLogin").show();
          $("#checkLogin > div > div > div > div > img , #img-previewProfile").attr("src", $(".imageuser").attr("src"));

           
          $("body").on('change', 'input[type=file]', function (e) {
          var file = e.originalEvent.target.files[0],
                  reader = new FileReader(file);
          reader.onload = function (evt) {
            $("body").find('.converteFiles').attr('src', thumbnail(evt.target.result, 70, 70));
//            $("#base64result").html(evt.target.result);
//            $("#base64result2").text(thumbnail($("#base64result").text(), size, size));
          };
//          reader.readAsDataURL(file);
        });
        $("body").on('dragenter', ".converteFiles", function (e) {
          e.stopPropagation();
          e.preventDefault();
          $(this).css('border', '2px solid #0B85A1');
        });
        $("body").on('dragover', ".converteFiles", function (e) {
          e.stopPropagation();
          e.preventDefault();
        });
        $("body").on('click', ".converteFiles", function (e) {
          var obj = $(this);
          obj.prev('input[type=file]').click();
        });
        $("body").on('drop', ".converteFiles", function (e) {
          $(this).css('border', '2px dotted #0B85A1');
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
              $("body").find('.converteFiles').attr('src', evt.target.result);
//              $("#base64result").html(evt.target.result);
//              $("#base64result2").text(thumbnail($("#base64result").text(), size, size));
//              $("#base64result3").text(thumbnail($("#base64result2").text(), 200, 200, true));
            };
            reader.readAsDataURL(file);
          });

        });


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
      image: function (e) {
            $(e.currentTarget).prev($("input[type=file]").click());
      },
      image2: function (e) {
          var file = e.originalEvent.target.files[0],
              reader = new FileReader(file);
          reader.onload = function (evt) {
              console.log(evt);
              $("body").find('.converteFiles').attr('src', evt.target.result);
              
//              $("#img-previewProfile").att("src", thumbnail($("#img-previewProfile").att("src"), 70, 70, true));
          };
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
