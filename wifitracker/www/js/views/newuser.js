/* global Backbone */

var NewUserView = Backbone.View.extend({
  events: {
    "click #submit-btn": "newuser"
  },
  initialize: function () {
  },
  newuser : function (){
    
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
