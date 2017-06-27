var colors = ["ee3322", "feebe9", "f43192", "0f65ef", "6645dd", "ffee00", "fffab6", "f47f16", 'f7ad19', '0dccb0', '68af15', 'e1efd0', 'aaaaaa', 'f4f4f4', '222222']
var colorObjects = [];

for (var i = 0; i < colors.length; i++) {
    var colorRGB = hexToRgb(colors[i]);
    var normColorHSV = RGBtoHSV(normRGB(colorRGB));

    var color = {
        r: colorRGB.r,
        g: colorRGB.g,
        b: colorRGB.b,
        h: Math.round(normColorHSV.h*360),
        s: Math.round(normColorHSV.s*100),
        v: Math.round(normColorHSV.v*100),
        hex: colors[i]
    }

    colorObjects.push(color);
}

window.onload = function() {
    var svg = d3.select("#colorCurve");
    var enterSelection = svg.selectAll('circle').data(colorObjects).enter()
    enterSelection.append('circle')
        .attr('cy', function(d) { return +svg.attr('height') - (d.h + 48) })
        .attr('cx', function(d,i) { return i * (+svg.attr('width') / colors.length) + 24})
        .attr('r', 8)
        .attr('stroke', "#00BFFF")
        .attr('stroke-width', 2)
        .attr('fill', 'rgba(0,191,255,.24)')
    enterSelection.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight','bold')
        .attr('y', function(d) { return +svg.attr('height') - (d.h + 48 + 12) })
        .attr('x', function(d,i) { return i * (+svg.attr('width') / colors.length) + 24})
        .text( function(d) { return d.h })

    enterSelection.append('circle')
        .attr('cy', function(d) { return +svg.attr('height') - (d.s + 48) })
        .attr('cx', function(d,i) { return i * (+svg.attr('width') / colors.length) + 24})
        .attr('r', 8)
        .attr('stroke', "#EE00FF")
        .attr('stroke-width', 2)
        .attr('fill', 'rgba(238,0,255,.24)')
        .text(function(d) { return d.s });
    enterSelection.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight','bold')
        .attr('y', function(d) { return +svg.attr('height') - (d.s + 48 + 12) })
        .attr('x', function(d,i) { return i * (+svg.attr('width') / colors.length) + 24})
        .text( function(d) { return d.s })

    enterSelection.append('circle')
        .attr('cy', function(d) { return +svg.attr('height') - (d.v + 48)})
        .attr('cx', function(d,i) { return i * (+svg.attr('width') / colors.length) + 24})
        .attr('r', 8)
        .attr('stroke', "#FFBB00")
        .attr('stroke-width', 2)
        .attr('fill', 'rgba(255,187,0,.24)')
        .text(function(d) { return d.v });
    enterSelection.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight','bold')
        .attr('y', function(d) { return +svg.attr('height') - (d.v + 48 + 12) })
        .attr('x', function(d,i) { return i * (+svg.attr('width') / colors.length) + 24})
        .text( function(d) { return d.v })

    enterSelection.append('circle')
        .attr('cy', +svg.attr('height') - 24)
        .attr('cx', function(d,i) { return i * (+svg.attr('width') / colors.length) + 24})
        .attr('r', 16)
        .attr('fill', function(d) { return "#" + d.hex })
  // d3.select('#color1').on('input', function() {
  //   update(this.value);
  // });

  // // Inital starting colors
  // update(colors)

  // function update(colors) {
  //   d3.select('#color1').attr('value', colors[0]);
  // }
}
