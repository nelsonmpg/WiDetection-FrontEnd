window.SideBarView = Backbone.View.extend({

  events: {
    "click #xpto":"funcaoClick"
  },
 funcaoClick:  function() {
   
 },  
  initialize: function() {
  },

  render: function() {
    var self=this;
    $(this.el).html(this.template());
    return this;
  }
});
