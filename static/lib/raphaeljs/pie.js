Raphael.fn.pieChart = function (cx, cy, r, values, labels, stroke, colors) {
    var paper = this,
        rad = Math.PI / 180,
        chart = this.set();
    function sector(cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * rad),
            x2 = cx + r * Math.cos(-endAngle * rad),
            y1 = cy + r * Math.sin(-startAngle * rad),
            y2 = cy + r * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }
    var angle = 0,
        total = 0,
        start = 0,
        process = function (j) {

            if(colors === 0){
                var color = Raphael.hsb(start, .75, 1);
                var bcolor = Raphael.hsb(start, 1, 1);
            } else {
                var color = colors[j];
                var bcolor = colors[j];
            }

            var value = values[j],
                angleplus = 360 * value / total;

            if(angleplus == 360){
                angleplus = 359;
            }

            var popangle = angle + (angleplus / 2),
                ms = 500,
                delta = 30,
                p = sector(cx, cy, r, angle, angle + angleplus, {fill: "90-" + bcolor + "-" + color, stroke: stroke, "stroke-width": 3}),
                txt = paper.text(cx + (r + delta + 55) * Math.cos(-popangle * rad), cy + (r + delta + 25) * Math.sin(-popangle * rad), labels[j]).attr({fill: bcolor, stroke: "none", opacity: 0, "font-size": 20});
            p.mouseover(function () {
                p.stop().animate({transform: "s1.1 1.1 " + cx + " " + cy}, ms, "elastic");
                txt.stop().animate({opacity: 1}, ms, "elastic");
            }).mouseout(function () {
                p.stop().animate({transform: ""}, ms, "elastic");
                txt.stop().animate({opacity: 0}, ms);
            });
            angle += angleplus;
            chart.push(p);
            chart.push(txt);
            start += .1;
        };
    for (var i = 0, ii = values.length; i < ii; i++) {
        total += values[i];
    }
    for (i = 0; i < ii; i++) {
        process(i);
    }
    return chart;
};

var buildGraph = function(uid, counts, labels, colors){

    var uid = uid;
    var labels = labels;
    var counts = counts;
    var colors = colors;
    var total = counts.reduce(function(p, c){return p+c; });
    var percents = counts.map(function(e, i){
        return (e/total) * 100;
    })

    if(typeof colors == "undefined"){
        colors = 0;
    }

    $(function(){
        for(var i=0;i<counts.length;i++){
          if(counts[i] == 0){
            counts.splice(i, 1);
            percents.splice(i, 1);
            labels.splice(i, 1);
            if(colors !== 0){
              colors.splice(i, 1);
            }
            i--;
          }
        }

        for(var i=0;i<labels.length;i++){
          labels[i] += "\n("+counts[i]+")";
        }

        var hsize = $("#"+uid).parent().width();

        Raphael(uid, hsize, hsize).pieChart(hsize / 2, hsize / 2, hsize / 4, percents, labels, "#fff", colors);
        $("#"+uid).parent().parent().find("table").parent().parent().height($("#"+uid).height());
    });
}
