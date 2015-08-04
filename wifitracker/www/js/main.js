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

        self.appEventBus.on("updateDisp", function (data, disp, site) {
            if (window.profile.get("site") && window.profile.get("site") == site) {
                self.dashboard.updatedisp(data, disp);
            }
        });

        self.appEventBus.on("newDisp", function (data, local, site) {
            if (window.profile.get("site") && window.profile.get("site") == site) {
                self.dashboard.newdisps(data, local);
            }
        });

        self.appEventBus.on('updateChart', function (site, data) {
            if (window.profile.get("site") && window.profile.get("site") == site) {
                self.dashboard.updateChart(data);
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

        if (this.socketclt) {
            this.socketclt.disconnect();
        }

        var self = this;
        self.loginform = new LoginView({});
        $('#content').html(self.loginform.render().el);
        self.loginform.checkloginstored();
    },
    inicio: function () {
        var self = this;
        self.verificaLogin(function () {
            self.socketclt.connect();

            self.socketclt.setuserid(window.profile.id);

            self.header = new HeaderView({
                logo: (window.profile.logo == "") ? "./img/user.png" : window.profile.logo
            });

            self.content = new InicioView();
            self.sidebar = new SideBarView({socket: self.socketclt});
            self.footer = new FooterView();
            self.contentnav = new ContentNavView();

            $('header').html(self.header.render().el);
            self.header.init();

            $('#contentnav').html(self.contentnav.render().el);
            self.contentnav.setView("Inicio");

            $('#content').html(self.content.render().el);

            $('aside.main-sidebar').html(self.sidebar.render().el);
            self.sidebar.addsitessidebar();

            $('footer').html(self.footer.render().el);
        });
    },
    dashboardSetup: function () {
        var self = this;
        self.verificaLogin(function () {
            self.dashboard = new DashboardView({
                socket: self.socketclt
            });
            $('#content').html(self.dashboard.render().el);
            self.dashboard.init();
            self.contentnav.setView("Dashboard");
        });
    },
    newUser: function () {
        var self = this;
        self.verificaLogin(function () {
            self.contentnav.setView("Registar");
            self.novoutilizador = new NewUserView({});
            $('#content').html(self.novoutilizador.render().el);
            self.novoutilizador.init();
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