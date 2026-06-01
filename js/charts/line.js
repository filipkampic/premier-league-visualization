import { getTeamColor } from "../utils/teamColors.js";
import { getTeamLogo } from "../utils/teamLogos.js";

const margin = { top: 20, right: 36, bottom: 40, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

let svg = null;
let crosshair = null;
let lockedTeam = null;

export function drawLineChart(data, selectedTeams) {
    lockedTeam = null;
    
    if (!svg) {
        svg = d3.select("#line-chart-svg")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("g").attr("class", "x-axis");
        svg.append("g").attr("class", "y-axis");

        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 35)
            .style("font-size", "11px")
            .style("fill", "#888")
            .style("letter-spacing", "0.8px")
            .text("MATCHDAY");

        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -height / 2)
            .attr("y", -40)
            .style("font-size", "11px")
            .style("fill", "#888")
            .style("letter-spacing", "0.8px")
            .text("POSITION");
        
        crosshair = svg.append("line")
            .attr("class", "crosshair")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#aaa")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4")
            .style("opacity", 0)
            .style("pointer-events", "none");

        svg.append("rect")
            .attr("class", "mouse-overlay")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .on("mousemove", (event) => {
                const [mx] = d3.pointer(event);
                crosshair
                    .attr("x1", mx)
                    .attr("x2", mx)
                    .style("opacity", 1);
            })
            .on("mouseleave", () => {
                crosshair.style("opacity", 0);
            });
    }

    const maxRound = d3.max(
        Object.values(data).flat(),
        d => d.round
    );

    const x = d3.scaleLinear()
        .domain([1, maxRound])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([20, 1])
        .range([height, 0]);

    svg.select(".x-axis")
        .transition().duration(400)
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(10));

    svg.select(".y-axis")
        .transition().duration(400)
        .call(d3.axisLeft(y).ticks(20));

    let tooltip = d3.select("#line-tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("id", "line-tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "6px 10px")
            .style("border-radius", "4px")
            .style("font-size", "13px")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }

    const lineGen = d3.line()
        .x(d => x(d.round))
        .y(d => y(d.position))
        .curve(d3.curveMonotoneX);

    const teams = svg.selectAll(".team-line")
        .data(selectedTeams, d => d);

    teams.enter()
        .append("path")
        .attr("class", "team-line")
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("stroke", team => getTeamColor(team))
        .attr("d", team => lineGen(data[team]))
        .style("cursor", "pointer")
        .merge(teams)
        .transition().duration(500)
        .attr("stroke", team => getTeamColor(team))
        .attr("d", team => lineGen(data[team]));

    teams.exit().remove();

    const endLogos = svg.selectAll(".team-end-logo")
        .data(selectedTeams, d => d);

    endLogos.enter()
        .append("image")
        .attr("class", "team-end-logo")
        .attr("width", 20)
        .attr("height", 20)
        .attr("href", team => getTeamLogo(team) || "")
        .attr("cx", team => x(data[team][data[team].length - 1].round))
        .attr("cy", team => y(data[team][data[team].length - 1].position))
        .attr("x", team => x(data[team][data[team].length - 1].round) + 8)
        .attr("y", team => y(data[team][data[team].length - 1].position) - 10)
        .on("click", (event, team) => {
            lockedTeam = lockedTeam === team ? null : team;
            if (lockedTeam) {
                svg.selectAll(".team-line")
                    .attr("stroke-width", t => t === lockedTeam ? 4 : 1.5)
                    .style("opacity", t => t === lockedTeam ? 1 : 0.2);
                svg.selectAll(".team-point")
                    .style("opacity", d => d.team === lockedTeam ? 1 : 0.1);
            } else {
                svg.selectAll(".team-line").attr("stroke-width", 2).style("opacity", 1);
                svg.selectAll(".team-point").style("opacity", 1);
            }
        })
        .on("mouseover", (event, team) => {
            if (lockedTeam) return;
            svg.selectAll(".team-line")
                .transition().duration(150)
                .attr("stroke-width", t => t === team ? 4 : 1.5)
                .style("opacity", t => t === team ? 1 : 0.2);
            svg.selectAll(".team-point")
                .transition().duration(150)
                .style("opacity", d => d.team === team ? 1 : 0.1);
        })
        .on("mouseout", () => {
            if (lockedTeam) return; 
            svg.selectAll(".team-line")
                .transition().duration(150)
                .attr("stroke-width", 2)
                .style("opacity", 1);
            svg.selectAll(".team-point")
                .transition().duration(150)
                .style("opacity", 1);
        })
        .merge(endLogos)
        .transition().duration(500)
        .attr("x", team => x(data[team][data[team].length - 1].round) + 8)
        .attr("y", team => y(data[team][data[team].length - 1].position) - 10);

    svg.selectAll(".team-end-logo").attr("href", team => getTeamLogo(team) || "");

    endLogos.exit().remove();   

    const points = svg.selectAll(".team-point")
        .data(
            selectedTeams.flatMap(team =>
                data[team].map(d => ({ ...d, team }))
            ),
            d => d.team + "-" + d.round
        );

    points.enter()
        .append("circle")
        .attr("class", "team-point")
        .attr("r", 4)
        .attr("fill", d => getTeamColor(d.team))
        .attr("cx", d => x(d.round))
        .attr("cy", d => y(d.position))
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`
                    <strong>${d.team}</strong><br>
                    Matchday: ${d.round}<br>
                    Position: ${d.position}<br>
                    Points: ${d.points}
                `);
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr("r", 6)
                .attr("fill", d3.color(getTeamColor(d.team)).darker(0.5));
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", (event, d) => {
            tooltip.style("opacity", 0);
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr("r", 4)
                .attr("fill", getTeamColor(d.team));
        })
        .merge(points)
        .transition().duration(500)
        .attr("cx", d => x(d.round))
        .attr("cy", d => y(d.position))
        .attr("fill", d => getTeamColor(d.team));
    
        points.exit().remove();
}
