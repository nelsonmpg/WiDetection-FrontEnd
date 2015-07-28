Backbone.View.prototype.close = function () {
  this.remove();
  this.unbind();
  this.undelegateEvents();
};

var Router = Backbone.Router.extend({
  header: undefined,
  footer: undefined,
  sidemenu: undefined,
  showView: function (view, elem, sub) {
    console.log("asdfasdfgsdfg");
    elem.show();

    if (this.currentView) {
      this.currentView.close();
    }
    this.currentView = view;
    this.currentView.delegateEvents();
    if (!sub) {
      elem.removeClass('col-sm-12');
      elem.addClass('col-sm-9');
    }

    var rendered = view.render();
    elem.html(rendered.el);
  },
  routes: {
    '': 'login'
  },
  initialize: function () {
    var self = this;
    self.content = $('#content').html(new LoginView().render().el);
    self.footer = $('#footer').html(new FooterView().render().el);
  },
  login: function () {
    this.header = undefined;
    this.footer = undefined;
    this.sidemenu = undefined;
    window.profile = null;

    $('#header').html('');
    $('#footer').html('');
    $('#sidemenu').html('');

    $('#content').html(new LoginView().render().el);
  }
});

templateLoader.load(['LoginView', 'FooterView'],
        function () {
          app = new Router();
          Backbone.history.start();
        }
);


