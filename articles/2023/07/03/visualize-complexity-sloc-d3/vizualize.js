
// set the dimensions and margins of the graph
const width = 400
const height = 400

const svg = d3.select("#loc")
  .append("svg")
    .attr("width", width)
    .attr("height", height)

const svg2 = d3.select("#locAdjusted")
  .append("svg")
    .attr("width", width)
    .attr("height", height);

// Read data
d3.json("/articles/2023/07/03/visualize-complexity-sloc-d3/loc.json").then( function(data) {

  let loc = 
    Object.entries(data)
        .filter(([key, value]) => !(key == "SUM" || key == "header"))
        .map(([filename, value]) => {
            return {...value, filename}
        });
    

   const color = d3.scaleOrdinal()
    .domain(["core", "util", "query", "index"])
    .range(d3.schemeSet1);
  
  // Size scale for countries
  const size = d3.scaleLinear()
    .domain([0, 500])
    .range([7, 55])  // circle will be between 7 and 55 px wide


  const mousemove = function(event, d) {
    let x = ((d.comment / d.code) * 100).toFixed(2);
    tt.innerHTML=`${d.filename} (${d.domain}), ${d.code} SLOC, Comment-to-code ratio: ${x}`;
  }
  const mouseleave = function(event, d) {
      tt.innerHTML = "";
  }

  // Initialize the circle: all located at the center of the svg area
  var node = svg.append("g")
    .selectAll("circle")
    .data(loc)
    .join("circle")
      .attr("class", "node")
      .attr("r", d => size(d.code))
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", d => color(d.domain))
      .style("fill-opacity", 0.8)
      .attr("stroke", "black")
      .style("stroke-width", 1)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .call(d3.drag() // call specific function when circle is dragged
           .on("start", dragstarted)
           .on("drag", dragged)
           .on("end", dragended));

  var node2 = svg2.append("g")
    .selectAll("circle")
    .data(loc)
    .join("circle")
      .attr("class", "node")
      .attr("r", d => {
        let adjustedLoc = (d.comment / d.code) * d.code;
        return size(Number.isNaN(adjustedLoc) ? 0 : adjustedLoc);
      })
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", d => color(d.domain))
      .style("fill-opacity", 0.8)
      .attr("stroke", "black")
      .style("stroke-width", 1)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .call(d3.drag() // call specific function when circle is dragged
           .on("start", dragstarted)
           .on("drag", dragged)
           .on("end", dragended));

  // Features of the forces applied to the nodes:
  const simulation = d3.forceSimulation()
      .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.code)+3) }).iterations(16)) // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
      .nodes(loc)
      .on("tick", function(d){
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)

        node2
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
      });


  // What happens when a circle is dragged?
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(.03).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(.03);
    d.fx = null;
    d.fy = null;
  }


})