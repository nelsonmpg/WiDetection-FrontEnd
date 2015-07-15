/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var BarChart = function (title, type, array) {
    this.title = title;
    this.type = type; //"column";
    this.dataPoints = array;
    this.chart = null;
    this.div = null;
}

this.BarChart.prototype.criar = function (div, click) {
    this.div = div;
    var graf = this;
    this.chart = new CanvasJS.Chart(this.div,
            {
                title: {
                    text: this.title
                },
                animationEnabled:true,
                data: [
                    {
                        type: this.type, //change type to bar, line, area, pie, etc
                        dataPoints: this.dataPoints,
                        click:click
                    }
                ]
            });
    this.chart.render();
}

