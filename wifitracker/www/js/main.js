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
  dashboard: undefined,
  appEventBus: undefined,
  novoutilizador: undefined,
  loginform: undefined,
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
    "Inicio": "inicio",
    "Dashboard": "dashboardSetup",
    "NovoUtilizador": "newUser",
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
    this.dashboard = undefined;
    this.appEventBus = undefined;
    this.novoutilizador = undefined;
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
  },
  inicio: function () {
    var self = this;

    self.socketclt.connect();

    self.socketclt.setuserid(window.profile.id);

    self.header = new HeaderView({
      logo: (window.profile.logo == "") ? "./img/user.png" : window.profile.logo
    });

    this.content = new InicioView();
    this.sidebar = new SideBarView({
      socket: self.socketclt
    });
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
  dashboardSetup: function () {
    var self = this;
    self.dashboard = new DashboardView({
      socket: self.socketclt
    });

    $('#content').html(self.dashboard.render().el);
    self.dashboard.init();
    this.contentnav.setView("Dashboard");
  },
  newUser: function () {
    this.contentnav.setView("Registar");
    var self = this;
    self.verificaLogin(function () {
      self.novoutilizador = new NewUserView({});
      $('#content').html(self.novoutilizador.render().el);
      self.contentnav.setView("Novo Utilizador");
    });
  },
  verificaLogin: function (loggedFunction) {
    var self = this;
    if (!getKeyo()) {
      app.navigate('', {
        trigger: true
      });
    } else {
      window.logged = true;
      loggedFunction();
    }
  }
});

templateLoader.load([
  "LoginView",
  "HeaderView",
  "InicioView",
  "SideBarView",
  "FooterView",
  "DashboardView",
  "NewUserView",
  "ContentNavView"],
        function () {
          app = new Router();
          Backbone.history.start();
        }
);