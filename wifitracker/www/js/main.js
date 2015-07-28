Backbone.View.prototype.close = function () {
  this.remove();
  this.unbind();
  this.undelegateEvents();
};

console.log("entrou no main.js Backbone");


window.templateLoader = {
  load: function (views, callback) {
    async.mapSeries(views, function (view, callbacki) {
      if (window[view] === undefined) {
        console.log('templates/' + view + '.html');
        console.log('js/views/' + view.replace('View', '').toLowerCase() + '.js');
        $.getScript('js/views/' + view.replace('View', '').toLowerCase() + '.js', function () {
          if (window[view].prototype.template === undefined) {
            $.get('templates/' + view + '.html', function (data) {
              window[view].prototype.template = _.template(data);
              callbacki();
            }, 'html');
          } else {
            callbacki();
          }
        });
      } else {
        callbacki();
      }
    }, function (error, data) {
      callback();
    });
  }
};

window.modem = function (type, url, sucess, error, data) {
  $.ajax({
    async: true,
    cache: false,
    type: type || 'GET',
    url: url,
    dataType: 'json',
    data: data,
    success: sucess,
    error: error
  });
};



var Router = Backbone.Router.extend({
  currentView: undefined,
  showView: function (view, elem, sub) {
    elem.show();

    if (sub == false) {
      if (this.currentView)
        this.currentView.close();

      this.currentView = view;
      this.currentView.delegateEvents();
    }
    var rendered = view.render();
    elem.html(rendered.el);
  },
  routes: {
    //Default Page
    "": "login",
    "/": "login",
    //Pagina Inicial
    "InicioView": "inicio",
    "Next": "next",
    "LoginView": "login",
    "SideBarView": "sidebar",
    "HeaderView": "header",
    "FooterView": "footer"
  },
  login: function () {
    window.sessionStorage.clear();
    var self = this;
    templateLoader.load(["LoginView"],
            function () {
              var v = new LoginView({});
              self.showView(v, $('#content'));
            }
    );
  },
  inicio: function () {
    $('header').html(new HeaderView().render().el);

    $('#content').html(new InicioView().render().el);

    $('aside').html(new SideBarView().render().el);

    $('footer').html(new FooterView().render().el);

//    var self = this;
//    templateLoader.load(["InicioView"],
//            function () {              
//              var v = new InicioView({});
//              self.showView(v, $('#content'));
//            }
//    );
  },
  sidebar: function () {
    var self = this;
    templateLoader.load(["SideBarView"],
            function () {
              var v = new SideBarView({});
              self.showView(v, $('aside'));
            }
    );
  },
  header: function () {
    var self = this;
    templateLoader.load(["HeaderView"],
            function () {
              var v = new HeaderView({});
              self.showView(v, $('header'));
            }
    );
//$("header").html(new HeaderView().render.el);
  },
  footer: function () {
    var self = this;
    templateLoader.load(["FooterView"],
            function () {
              var v = new FooterView({});
              self.showView(v, $('footer'));
            }
    );
  },
  next: function () {
    var self = this;
    templateLoader.load(["Next"],
            function () {
              var v = new Next({});
              self.showView(v, $('#content'));
            }
    );
  }
});

templateLoader.load(["LoginView", "HeaderView", "InicioView", "SideBarView","FooterView"],
        function () {
          app = new Router();
          Backbone.history.start();
        }
);