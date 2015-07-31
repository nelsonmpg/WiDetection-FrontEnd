var Profile = Backbone.Model.extend({
  initialize: function () {
  },
  setuser: function (user, after_fetch) {
    var self = this;
    self.set('id', user._id);
console.log(user);
    self.set('username', user.username);
    self.set('gravatar', user.username);
    after_fetch();
  },
  fetch: function (user, after_fetch, after_fetch2) {
    var self = this;
    if (user !== null) {
      self.setuser(user, after_fetch);
    } else {
      modem('POST', '/login',
              function (json) {
                self.setuser(json, after_fetch);
              },
              function (xhr, ajaxOptions, thrownError) {
                window.profile = null;
                window.sessionStorage.clear();
                if (after_fetch2)
                  after_fetch2();
              }
      );
    }
  }
});