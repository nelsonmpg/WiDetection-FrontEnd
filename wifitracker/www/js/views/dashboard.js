window.DashboardView = Backbone.View.extend({
  loading: '<div class="box box-solid box-loading">' +
          '<div class="box-body">' +
          '</div><!-- /.box-body -->' +
          '<!-- Loading (remove the following to stop the loading)-->' +
          '<div class="overlay">' +
          '<i class="fa fa-refresh fa-spin"></i>' +
          '</div>' +
          '<!-- end loading -->' +
          '</div><!-- /.box -->',
  socketDashboard: null,
  events: {
  },
  initialize: function (opt) {
    this.socketDashboard = opt.socket;
  },
  init: function () {
    var self = this;
    $("body").find("#chart2bars").html(self.loading);
    $("body").find("#chart1LineActives").html(self.loading);
    $("body").find("#chartDispVisit").html(self.loading);
    modem("GET",
            "/getNumDispositivos/" + window.profile.id,
            function (data) {
              $("body").find("#sensores-num-div").html(data.sensor);
              $("body").find("#disp-num-div").html(data.moveis);
              $("body").find("#ap-num-div").html(data.ap);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
    modem("GET",
            "/getAllAntenasAndDisps/" + window.profile.id,
            function (data) {
              graph2Bar = new ArrayToGraph(data, "Quantidade de Dispositivos / Sensor", "", "chart2bars", "column");
              // para aparecer a div com os resultados
              graph2Bar.createArrayToGraphTwoBar();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
    $.AdminLTE.boxWidget.activate();
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
