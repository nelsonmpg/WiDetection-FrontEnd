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
  probes: undefined,
  admin: undefined,
  appEventBus: undefined,
  novoutilizador: undefined,
  loginform: undefined,
  editprofile: undefined,
  about : undefined,
  socketclt: null,
  initialize: function () {
    var self = this;
    self.appEventBus = _.extend({}, Backbone.Events);
    self.socketclt = new socketClient({vent: self.appEventBus});

    // update dos graficos em realtime
    self.appEventBus.on("updateRealTimeChart", function (data, local, site) {
      if (window.profile.get("site") && window.profile.get("site") == site &&
              Backbone.history.getFragment() == "Dashboard") {
        self.dashboard.updatePower(data, local);
      }
    });

    // Update no dashboard do total de dispositivos encontrados
    self.appEventBus.on("newDisp", function (data, local, site) {
      if (window.profile.get("site") && window.profile.get("site") == site &&
              Backbone.history.getFragment() == "Dashboard") {
        self.dashboard.newdisps(data, local);
      }
    });

    // Lista de divices encointrados por minuto na utlima hora
    self.appEventBus.on('getAllDisp', function (data, site) {
      if (window.profile.get("site") && window.profile.get("site") == site &&
              Backbone.history.getFragment() == "Dashboard") {
        self.dashboard.createChartDispActive(data);
      }
    });

    // atualizacao do grafico de dispositivos encontrafos na ultima hora
    self.appEventBus.on('updateChart', function (x, site) {
      if (window.profile.get("site") && window.profile.get("site") == site &&
              Backbone.history.getFragment() == "Dashboard") {
        self.dashboard.updateChart(x);
      }
    });

    // update do estado de utilizacao do sensor
    self.appEventBus.on('changeActiveAnt', function (data, site) {
      if (window.profile.get("site") && window.profile.get("site") == site &&
              Backbone.history.getFragment() == "Detail") {
        self.detail.updateDataSensor(data);
      }
    });
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
    "EditProfile": "editProfile",
    "Detail": "detail",
    "DetailAP": "detaialap",
    "DetailDevice": "detaildevice",
    "AdminSites": "adminsites",
    "Probes": "probesBoard",
    "About": "aCercaDe",
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
    this.editprofile = undefined;
    $('header').html("");
    $('#content').html("");
    $('aside.main-sidebar').html("");
    $('footer').html("");
    $('contentnav').html("");
    window.profile = null;
    window.sessionStorage.clear();
    window.logged = false;
    if (this.socketclt) {
      this.socketclt.disconnect();
    }

    var self = this;
    self.loginform = new LoginView({});
    $('#content').html(self.loginform.render().el);
    windowScrollTop();
    self.loginform.checkloginstored();
  },
  aCercaDe: function () {
    var self = this;
    self.verificaLogin(function () {
      self.about = new AboutView();
      self.contentnav.setView("About");
      $('#content').html(self.about.render().el);
      windowScrollTop();
    });
  },
  inicio: function () {
    var self = this;
    self.verificaLogin(function () {

      if (typeof window.profile.get("site") == "undefined") {
        self.socketclt.connect();
        self.socketclt.setuserid(window.profile.id);
        self.header = new HeaderView({
          logo: (window.profile.logo == "") ? "./img/user.png" : window.profile.logo
        });
        self.footer = new FooterView();
        self.contentnav = new ContentNavView();
        $('header').html(self.header.render().el);
        self.header.init();
        $('#contentnav').html(self.contentnav.render().el);
        $('footer').html(self.footer.render().el);
      } else {
        self.sidebar.resetValues();
      }
      self.sidebar = new SideBarView({socket: self.socketclt});
      $('aside.main-sidebar').html(self.sidebar.render().el);
      self.contentnav.setView("Start Menu");
      self.sidebar.addsitessidebar();

      self.content = new InicioView();
      $('#content').html(self.content.render().el);
      windowScrollTop();
    });
  },
  detail: function () {
    var self = this;
    self.verificaLogin(function () {
      self.detail = new DetailView();
      self.contentnav.setView("Details  >  Sensor");
      $('#content').html(self.detail.render().el);
      self.detail.init((typeof window.profile.get("sensor-sel") == "undefined") ? null : (window.profile.get("sensor-sel"), self.sidebar.setDetailSensor("Sensor")));
      windowScrollTop();
    });
  },
  detaialap: function () {
    var self = this;
    self.verificaLogin(function () {
      self.detailap = new DetailAPView();
      self.contentnav.setView("Details  >  Access Point");
      $('#content').html(self.detailap.render().el);
      self.detailap.init((typeof window.profile.get("nav-mac") == "undefined") ? null : (window.profile.get("nav-mac"), self.sidebar.setActive("Access")));
      windowScrollTop();
    });
  },
  detaildevice: function () {
    var self = this;
    self.verificaLogin(function () {
      self.detaildevice = new DetailDeviceView();
      self.contentnav.setView("Details  >  Device");
      $('#content').html(self.detaildevice.render().el);
      var obj = [];
      if (typeof window.profile.get("nav-vendor") != "undefined" && typeof window.profile.get("nav-mac") != "undefined") {
        obj = {
          vendor: window.profile.get("nav-vendor"),
          mac: window.profile.get("nav-mac")
        };
        window.profile.set("nav-vendor", undefined);
        window.profile.set("nav-mac", undefined);
      }
      self.detaildevice.init(obj, self.sidebar.setActive("Devices"));
      windowScrollTop();
    });
  },
  dashboardSetup: function () {
    var self = this;
    self.verificaLogin(function () {
      self.dashboard = new DashboardView({
        socket: self.socketclt
      });
      $('#content').html(self.dashboard.render().el);
      self.contentnav.setView("Dashboard");
      self.dashboard.init();
      windowScrollTop();
    });
  },
  adminsites: function () {
    var self = this;
    self.verificaLogin(function () {
      if (self.socketclt) {
        self.socketclt.disconnect();
      }
      self.contentnav.setView("Administration");
      self.sidebar.resetValues();
      self.sidebar = new SideBarView({socket: self.socketclt});
      $('aside.main-sidebar').html(self.sidebar.render().el);
      self.admin = new AdminView({socket: self.socketclt});
      $('#content').html(self.admin.render().el);
      self.admin.init();

      self.sidebar.selectadmin();
      windowScrollTop();
    });
  },
  newUser: function () {
    var self = this;
    self.verificaLogin(function () {
      self.contentnav.setView("Registar");
      self.novoutilizador = new NewUserView({});
      $('#content').html(self.novoutilizador.render().el);
      self.novoutilizador.init();
      self.contentnav.setView("New User");
      self.sidebar.removeActive();
      windowScrollTop();
    });
  },
  probesBoard: function () {
    var self = this;
    self.verificaLogin(function () {
      self.contentnav.setView("Probes");
      self.probes = new ProbesView({});
      $('#content').html(self.probes.render().el);
      var prob = undefined;
      if (typeof window.profile.get("probe") != "undefined") {
        prob = window.profile.get("probe");
        window.profile.set("probe", undefined);
        self.sidebar.setActive("Probes")
      }
      self.probes.init(prob);
      windowScrollTop();
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
  },
  editProfile: function () {
    var self = this;
    self.verificaLogin(function () {
      self.editprofile = new EditProfileView();
      self.contentnav.setView("Profile");
      $('#content').html(self.editprofile.render().el);
      self.editprofile.init();
      self.sidebar.removeActive();
    });
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
  "ContentNavView",
  "EditProfileView",
  "DetailView",
  "DetailAPView",
  "DetailDeviceView",
  "AdminView",
  "ProbesView",
  "AboutView"],
        function () {
          app = new Router();
          Backbone.history.start();
        }
);