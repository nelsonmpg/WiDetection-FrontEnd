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
  iduserative : undefined,
  events: {
  },
  initialize: function (opt) {
    this.socketDashboard = opt.socket;
    this.iduserative = opt.iduser;
  },
  init: function () {
    var self = this;
    $("body").find("#chart2bars").html(self.loading);
    $("body").find("#chart1LineActives").html(self.loading);
    $("body").find("#chartDispVisit").html(self.loading);
    console.log(self.socketDashboard.id);
    $.ajax({
      type: "GET",
      url: "/getNumDispositivos/" + self.iduserative,
      dataType: 'json',
      success: function (data) {
        $("body").find("#sensores-num-div").html(data.sensor);
        $("body").find("#disp-num-div").html(data.moveis);
        $("body").find("#ap-num-div").html(data.ap);
      },
      error: function (error) {
        console.log(JSON.stringify(error));
      }
    });
    $.ajax({
      type: "GET",
      url: "/getAllAntenasAndDisps/" + self.iduserative,
      dataType: 'json',
      success: function (data) {
        graph2Bar = new ArrayToGraph(data, "Quantidade de Dispositivos / Sensor", "", "chart2bars", "column");
        // para aparecer a div com os resultados
        graph2Bar.createArrayToGraphTwoBar();
      },
      error: function (error) {
        console.log(JSON.stringify(error));
      }
    });
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
