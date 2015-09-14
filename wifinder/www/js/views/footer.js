window.FooterView = Backbone.View.extend({
  events: {
    "click .clickhref": function (e){
      e.preventDefault();
      window.open($(e.currentTarget).attr("href"), '_blank');
    }
  },
  initialize: function () {
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
