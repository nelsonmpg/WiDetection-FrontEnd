window.HeaderView = Backbone.View.extend({

   events: {
    "click #logout-btn":"logout"
  },
  logout: function(){
    window.localStorage.setItem("Logged", false);
    app.navigate("/Login", {
      trigger: true
    });
  },  
  initialize: function() {
  },

  render: function() {
    var self=this;
    $(this.el).html(this.template());
    return this;
  }
});

