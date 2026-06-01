import { getTeamColor } from "../utils/teamColors.js";
import { getTeamLogo } from "../utils/teamLogos.js";

const margin = { top: 40, right: 40, bottom: 120, left: 60 };
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

let svg = null;

export function drawScatterPlot(data) {
    const teamStats = {};

    data.forEach(d => {
        if (!teamStats[d.HomeTeam]) teamStats[d.HomeTeam] = { gf: 0, ga: 0 };
        if (!teamStats[d.AwayTeam]) teamStats[d.AwayTeam] = { gf: 0, ga: 0 };

        teamStats[d.HomeTeam].gf += +d.FTHG;
        teamStats[d.HomeTeam].ga += +d.FTAG;
        teamStats[d.AwayTeam].gf += +d.FTAG;
        teamStats[d.AwayTeam].ga += +d.FTHG;
    });

    const chartData = Object.entries(teamStats).map(([team, s]) => ({
        team,
        gf: s.gf,
        ga: s.ga
    }));

    const avgGF = d3.mean(chartData, d => d.gf);
    const avgGA = d3.mean(chartData, d => d.ga);
    if (!svg) {
        svg = d3.select("#scatter-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("g")
            .attr("class", "grid-x")
            .attr("transform", `translate(0,${height})`);

        svg.append("g")
            .attr("class", "grid-y");

        svg.append("g").attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`);

        svg.append("g").attr("class", "y-axis");

        svg.append("text")
            .attr("class", "x-label")
            .attr("x", width / 2)
            .attr("y", height + 45)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#888")
            .text("Goals For (GF)");

        svg.append("text")
            .attr("class", "y-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#888")
            .text("Goals Against (GA)");

        svg.append("line").attr("class", "avg-line-x");
        svg.append("line").attr("class", "avg-line-y");

        const quadrants = svg.append("g").attr("class", "quadrants");
        quadrants.append("rect").attr("class", "q-elite");
        quadrants.append("rect").attr("class", "q-highscoring");
        quadrants.append("rect").attr("class", "q-defensive");
        quadrants.append("rect").attr("class", "q-struggling");

        const defs = svg.append("defs");
        defs.append("marker")
            .attr("id", "arrowhead")
            .attr("markerWidth", 6).attr("markerHeight", 6)
            .attr("refX", 3).attr("refY", 3)
            .attr("orient", "auto")
            .append("polygon")
            .attr("points", "0 0, 6 3, 0 6")
            .attr("fill", "#aaa");

        svg.append("line").attr("class", "arrow-gf");
        svg.append("line").attr("class", "arrow-ga");

        const legendData = [
            { color: "rgba(76,175,80,0.25)",  label: "Elite" },
            { color: "rgba(255,193,7,0.25)", label: "Defensive" },
            { color: "rgba(33,150,243,0.25)",  label: "High Scoring" },
            { color: "rgba(244,67,54,0.25)",  label: "Struggling" },
        ];

        const lg = svg.append("g")
            .attr("class", "scatter-legend")
            .attr("transform", `translate(0, ${height + 75})`)
            .attr("transform", `translate(${width / 2 - 160}, ${height + 75})`);

        legendData.forEach((d, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const g = lg.append("g").attr("transform", `translate(${col * 280}, ${row * 18})`);
            g.append("rect").attr("width", 12).attr("height", 12).attr("rx", 2).attr("fill", d.color).attr("stroke", "#ccc").attr("stroke-width", 0.5);
            g.append("text").attr("x", 18).attr("y", 10).style("font-size", "11px").style("fill", "#888").text(d.label);
        });
    }

    let tooltip = d3.select("#scatter-tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("id", "scatter-tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "6px 10px")
            .style("border-radius", "4px")
            .style("font-size", "13px")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }

    const maxVal = d3.max(chartData, d => Math.max(d.gf, d.ga)) * 1.1;

    const x = d3.scaleLinear()
        .domain([0, maxVal])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, maxVal])
        .range([0, height]);

    svg.select(".grid-x")
        .transition().duration(400)
        .call(d3.axisBottom(x).ticks(6).tickSize(-height).tickFormat(""))
        .selectAll("line").style("stroke", "#DDDDDD").style("stroke-width", 1);

    svg.select(".grid-y")
        .transition().duration(400)
        .call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(""))
        .selectAll("line").style("stroke", "#DDDDDD").style("stroke-width", 1);

    svg.selectAll(".grid-x .domain, .grid-y .domain").style("display", "none");

    svg.select(".x-axis")
        .transition().duration(400)
        .call(d3.axisBottom(x).ticks(6));

    svg.select(".y-axis")
        .transition().duration(400)
        .call(d3.axisLeft(y).ticks(6));

    svg.select(".avg-line-x")
        .transition().duration(400)
        .attr("x1", x(avgGF)).attr("y1", 0)
        .attr("x2", x(avgGF)).attr("y2", height)
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");

    svg.select(".avg-line-y")
        .transition().duration(400)
        .attr("x1", 0).attr("y1", y(avgGA))
        .attr("x2", width).attr("y2", y(avgGA))
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");

    const qx = x(avgGF);
    const qy = y(avgGA);

    svg.select(".q-elite")
        .attr("x", qx).attr("y", 0)
        .attr("width", width - qx).attr("height", qy)
        .attr("fill", "rgba(76, 175, 80, 0.07)");

    svg.select(".q-highscoring")
        .attr("x", qx).attr("y", qy)
        .attr("width", width - qx).attr("height", height - qy)
        .attr("fill", "rgba(33, 150, 243, 0.07)");

    svg.select(".q-defensive")
        .attr("x", 0).attr("y", 0)
        .attr("width", qx).attr("height", qy)
        .attr("fill", "rgba(255, 193, 7, 0.07)");

    svg.select(".q-struggling")
        .attr("x", 0).attr("y", qy)
        .attr("width", qx).attr("height", height - qy)
        .attr("fill", "rgba(244, 67, 54, 0.07)");

    svg.select(".arrow-gf")
        .attr("x1", 0).attr("y1", 8)
        .attr("x2", 0).attr("y2", 28)
        .attr("stroke", "#aaa").attr("stroke-width", 1.5)
        .attr("marker-end", "url(#arrowhead)");

    svg.select(".arrow-ga")
        .attr("x1", 8).attr("y1", 0)
        .attr("x2", 28).attr("y2", 0)
        .attr("stroke", "#aaa").attr("stroke-width", 1.5)
        .attr("marker-end", "url(#arrowhead)");

    const logoSize = 28;

    const dots = svg.selectAll(".dot")
        .data(chartData, d => d.team);

    const dotsEnter = dots.enter()
        .append("image")
        .attr("class", "dot")
        .attr("width", logoSize)
        .attr("height", logoSize)
        .attr("x", d => x(d.gf) - logoSize / 2)
        .attr("y", d => y(d.ga) - logoSize / 2)
        .attr("href", d => getTeamLogo(d.team));

    dotsEnter.merge(dots)
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`<strong>${d.team}</strong><br>GF: ${d.gf}<br>GA: ${d.ga}`);
            d3.select(event.currentTarget)
                .attr("width", logoSize * 1.4)
                .attr("height", logoSize * 1.4)
                .attr("x", d => x(d.gf) - (logoSize * 1.4) / 2)
                .attr("y", d => y(d.ga) - (logoSize * 1.4) / 2);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", (event, d) => {
            tooltip.style("opacity", 0);
            d3.select(event.currentTarget)
                .attr("width", logoSize)
                .attr("height", logoSize)
                .attr("x", d => x(d.gf) - logoSize / 2)
                .attr("y", d => y(d.ga) - logoSize / 2);
        })
        .transition().duration(500)
        .attr("x", d => x(d.gf) - logoSize / 2)
        .attr("y", d => y(d.ga) - logoSize / 2);

    dots.exit().remove();
}
