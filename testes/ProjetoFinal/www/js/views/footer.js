window.FooterView = Backbone.View.extend({
  events: {
    'click .clickhref': 'clickhref'
  },
  clickhref: function () {
    alert("ola");
  },
  render: function () {
    $(this.el).html(this.template());
    return this;
  }
});