/* global Backbone, _, templateLoader, app */

Backbone.View.prototype.close = function () {
  this.remove();
  this.unbind();
  this.undelegateEvents();
};

var Router = Backbone.Router.extend({
  currentView: undefined,
  header: undefined,
  sidebar: undefined,
  contentheader: undefined,
  contentnav: undefined,
  content: undefined,
  footer: undefined,
  configform: undefined,
  loginform: undefined,
  initialize: function () {

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
    "Inicio": "inicio",
    "ConfigSite": "configsite",
    '*notFound': 'login'
  },
  login: function () {
    this.currentView = undefined;
    this.header = undefined;
    this.sidebar = undefined;
    this.contentheader = undefined;
    this.contentnav = undefined;
    this.content = undefined;
    this.footer = undefined;
    this.loginform = undefined;

    $('header').html("");
    $('#content').html("");
    $('aside.main-sidebar').html("");
    $('footer').html("");
    $('contentnav').html("");

    window.profile = null;
    window.sessionStorage.clear();
    window.logged = false;

    var self = this;
    self.loginform = new LoginView({});
    $('#content').html(self.loginform.render().el);
    self.loginform.checkloginstored();
  },
  inicio: function () {
    var self = this;
    self.verificaLogin(function () {
      self.header = new HeaderView({
        logo: (window.profile.logo == "") ? "./img/user.png" : window.profile.logo
      });

      self.content = new InicioView();
      self.sidebar = new SideBarView({});
      self.footer = new FooterView();
      self.contentnav = new ContentNavView();

      $('header').html(self.header.render().el);
      self.header.init();

      $('#contentnav').html(self.contentnav.render().el);
      self.contentnav.setView("Inicio");

      $('#content').html(self.content.render().el);

      $('aside.main-sidebar').html(self.sidebar.render().el);

      $('footer').html(self.footer.render().el);
    });
  },
  configsite: function () {
    var self = this;
    self.verificaLogin(function () {
      self.configform = new ConfigSiteView({});
      $('#content').html(self.configform.render().el);
      self.configform.init();
      self.contentnav.setView("COnfig Site");
    });
  },
  verificaLogin: function (loggedFunction) {
    var self = this;
    if (window.profile == undefined) {
      app.navigate('', {
        trigger: true
      });
    } else {
      if (!getKeyo()) {
        app.navigate('', {
          trigger: true
        });
      } else {
        window.logged = true;
        loggedFunction();
      }
    }
  }
});

templateLoader.load([
  "LoginView",
  "HeaderView",
  "InicioView",
  "SideBarView",
  "FooterView",
  "ConfigSiteView",
  "ContentNavView"],
        function () {
          app = new Router();
          Backbone.history.start();
        }
);