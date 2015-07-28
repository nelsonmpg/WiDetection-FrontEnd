window.Next = Backbone.View.extend({

  events: {
    "click a":"alert"
  },

  alert:function(){
    alert($(this));
  },
  initialize: function() {
    console.log("New:");
    console.log(this);
  },

  render: function() {
    var self=this;

    $(this.el).html(this.template());

    return this;
  }
});
