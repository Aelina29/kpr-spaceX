import {SpaceX} from "/src/api/spacex.js";
import * as Geo from './geo.json';
import * as d3 from "d3";

document.addEventListener("DOMContentLoaded", setup)
var dots = [];
var padder = {};

function setup(){
    const spaceX = new SpaceX();
    spaceX.launchpads().then(data=>{
        data.forEach(pad=>{
            for(let i = 0; i < dots.length; ++i){
                if((Math.trunc(dots[i][1]) == pad.longitude) && (Math.trunc(dots[i][2]) == pad.latitude)){
                    padder[`launch_${pad.id}`] = dots[i][0];
                    break;
                }
            }
            dots.push([`launch_${pad.id}`,pad.longitude,pad.latitude]);     
        })

    });
    spaceX.launches().then(data=>{
        const listContainer = document.getElementById("listContainer")
        RenderLaunches(data, listContainer);
        drawMap();
    })
}

function RenderLaunches(launches, container){
    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = document.createElement("li");
        item.innerHTML = launch.name;
        item.onmouseover = highLaunchpad;
        item.onmouseout = darkLaunchpad;
        if (`launch_${launch.launchpad}` in padder)
            item.setAttribute("launchpad", padder[`launch_${launch.launchpad}`]);       
        else item.setAttribute("launchpad", `launch_${launch.launchpad}`);
      
        list.appendChild(item);
    })
    container.replaceChildren(list);
}

function highLaunchpad(event) {
    d3.select("#" + event.target.getAttribute("launchpad")).style("stroke-width", 10).style("stroke", "blue");
}

function darkLaunchpad(event) {
    d3.select("#" + event.target.getAttribute("launchpad")).style("stroke-width", 1).style("stroke", "red");
}

function drawMap(){
    const width = 640;
    const height = 480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};
    const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    const projection = d3.geoMercator()
        .scale(70)
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2]);
    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("opacity", .7)
    svg.selectAll("circle")
        .data(dots).enter()
        .append("circle")
        .style("fill", "red")
        .attr("id", function (d) { return d[0]; })
        .attr("cx", function (d) { return projection(d.slice(1))[0]; })
        .attr("cy", function (d) { return projection(d.slice(1))[1]; })
        .attr("r", "2px")
}
