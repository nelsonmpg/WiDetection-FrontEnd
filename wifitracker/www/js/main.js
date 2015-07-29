/* global Backbone, _, templateLoader */

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
  header: undefined,
  sidebar: undefined,
  contentheader: undefined,
  contentnav:undefined,
  content: undefined,
  footer: undefined,
  dashboard: undefined,
  appEventBus: undefined,
  socketclt: null,
  initialize: function () {
    var self = this;
    self.appEventBus = _.extend({}, Backbone.Events);
    self.socketclt = new socketClient({vent: self.appEventBus});
  },
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
    //Pagina Inicial
    "InicioView": "inicio",
    "Next": "next",
    "LoginView": "login",
    "DashboardView": "dashboardSetup"
  },
  login: function () {
    $('header').html("");
    $('#content').html("");
    $('aside.main-sidebar').html("");
    $('footer').html("");
    $('contentnav').html("");

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
    var self = this;

    self.socketclt.connect();

    this.header = new HeaderView({name: "abc", logo: "./img/userImg.png"});
    this.content = new InicioView();
    this.sidebar = new SideBarView({socket: self.socketclt});
    this.footer = new FooterView();
    this.contentnav = new ContentNavView();

    $('header').html(this.header.render().el);
    this.header.init();
    
   $('#contentnav').html(this.contentnav.render().el);
   this.contentnav.setView("Inicio");

    $('#content').html(this.content.render().el);

    $('aside.main-sidebar').html(this.sidebar.render().el);
    this.sidebar.addsitessidebar();

    $('footer').html(this.footer.render().el);

  },
  dashboardSetup : function () {
    var self = this;
    alert();
  }
});

templateLoader.load(["LoginView", "HeaderView", "InicioView", "SideBarView", "FooterView","ContentNavView"],
        function () {
          app = new Router();
          Backbone.history.start();
        }
);