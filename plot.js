"use strict";

var w = 1000;
var h = 600;

var margin = 60;

function initialize(file, callback) {
  d3.tsv(file, function(d) {
    d.forEach(function(item) {
      item.Maara = Number(item.Maara);
      item.Osuus = Number(item.Osuus);
    });
    var dataset = parseData(d);
    callback(dataset);
  });
}

// Yhdistetään datassa ne rivit, joissa määrä on täysin sama
// Siis lähinnä harvinaisimmat, joita on vain muutamia
function parseData(data) {
  var newData = [];
  var previousAmount = 0;
  data.forEach(function(d, i) {
    if (d.Maara !== previousAmount) {
      // Lisätään myös järjestysnumero datassa
      d.Indeksi = i + 1;
      newData.push(d);
      previousAmount = d.Maara;
    } else {
      var lastIndex = newData.length - 1;
      newData[lastIndex].Maa += ", " + d.Maa;
      newData[lastIndex].Koodi += ", " + d.Koodi;
    }
  });
  return newData;
}

function draw(data) {
  var dataset = data;
  var currentIndex = 0;
  var currentData = [];
  currentData = dataset.slice(currentIndex, currentIndex + 10);

  var xScale = d3.scale.ordinal()
    .domain(d3.range(11))
    .rangeRoundBands([margin, w], 0.02); // Low and high value for the range, spacing between bands

  var yScale = d3.scale.linear()
    .domain([0, currentData[0].Maara + (currentData[0].Maara * 0.1)])
    .range([h - margin, 0 + margin / 5]);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(10);

  //Create SVG element
  var svg = d3.select("#kaavio")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

  //Create bars
  svg.selectAll("rect")
    .data(currentData)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
      return xScale(i);
    })
    .attr("y", function(d) {
      return yScale(d.Maara);
    })
    .attr("width", xScale.rangeBand())
    .attr("height", function(d) {
      return yScale(0) - yScale(d.Maara);
    })
    .attr("fill", function(d, i) {
      var value = Math.round(252 / (i + 1));
      return "rgb(0, 0, 255)";
    })
    .on("mouseover", function(d) {
      //Get this bar"s x/y values, then augment for the tooltip
      var xPosition = w;
      var yPosition = 0 + 20;

      d3.select(this)
        .attr("fill", "red");

      //Update the tooltip position and value
      d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#maa")
        .text(function() {
          return "" + d.Indeksi + ". " + d.Maa;
        });

      d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#maara")
        .text(function() {
          //var osuus = Math.round(d.Osuus);
          var osuus = (d.Osuus).toFixed(1);
          if (osuus > 0) {
            return "" + d.Maara + " nimekettä (" + osuus + " %)";
          } else {
            return "" + d.Maara + " nimekettä";
          }   
        });

      //Show the tooltip
      d3.select("#tooltip").classed("hidden", false);
    })
    
    .on("mouseout", function() {
      //Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);
      d3.select(this)
      .transition()
      .ease("linear")
      .duration(200)
      .attr("fill", function() {
        return "rgb(0, 0, 255)";
      });

    });

      //Create labels
  svg.selectAll("text")
    .data(currentData)
    .enter()
    .append("text")
    .text(function(d) {
      return d.Koodi;
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d, i) {
      return xScale(i) + xScale.rangeBand() / 2;
    })
    .attr("y", function(d) {
      return yScale(d.Maara) + 10;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "12px")
    .attr("fill", "white");

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin + ", 0)")
    .call(yAxis);

  d3.select("#plusYksi")
    .on("click", function() {
      update(1);
    });

  d3.select("#plusKymmenen")
    .on("click", function() {
      update(10);
    });

  d3.select("#miinusKymmenen")
    .on("click", function() {
      update(-10);
    });

  d3.select("#miinusYksi")
    .on("click", function() {
      update(-1);
    });

    function update(amount) {

      if (currentIndex += amount > 0) {
        currentIndex += amount;
      } else {
        currentIndex = 0;
      }
     
      if (currentIndex + 10 <= dataset.length) {
        currentData = dataset.slice(currentIndex, currentIndex + 10);
      } else {
        currentData = dataset.slice(dataset.length - 10, dataset.length);
        currentIndex = 0;
      }

      yScale.domain([0, currentData[0].Maara + (currentData[0].Maara * 0.1)]);
      svg.selectAll("rect")
        .data(currentData)
        .transition()
        .ease("linear")
        .attr("x", function(d, i) {
          return xScale(i);
        })
        .attr("y", function(d) {
          return yScale(d.Maara);
        })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) {
          return yScale(0) - yScale(d.Maara);
        })
        .attr("fill", function() {
          return "rgb(0, 0, 255)";
        });

      svg.selectAll("text")
        .data(currentData)
        .transition()
        .ease("linear")
        .duration(500)
        .each("start", function() {
          d3.select(this)
            .attr("fill", "black");
        })
        .text(function(d) {
          if (d.Koodi.length < 10) {
            return d.Koodi;
          } else {
            return d.Koodi.slice(0,3) + '...';
          }
        })
        .attr("x", function(d, i) {
          return xScale(i) + xScale.rangeBand() / 2;
        })
        .attr("y", function(d) {
          return yScale(d.Maara) + 10;
        })
        .each("end", function() {
          d3.select(this)
            .attr("fill", "white");       
        });

      svg.select(".y.axis")
      .transition()
      .duration(1000)
      .call(yAxis);
    }
}

// initialize("./data/countriesAsTSV.tsv", draw);
initialize("./data/languagesAsTSV.tsv", draw);