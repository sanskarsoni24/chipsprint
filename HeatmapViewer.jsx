import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Dummy DEF parser extracts diearea from design.def
const parseDEF = async (defBlob) => {
  const text = await defBlob.text();
  // Look for "DIEAREA ( x1 y1 ) ( x2 y2 ) ;"
  const m = text.match(/DIEAREA\s+\(\s*(\d+)\s+(\d+)\s*\)\s+\(\s*(\d+)\s+(\d+)\s*\)/);
  if (!m) return { width: 1000, height: 1000 }; // fallback
  return {
    x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4],
    width: +m[3] - +m[1], height: +m[4] - +m[2],
  };
};

export default function HeatmapViewer({ defFile, violations }) {
  const svgRef = useRef();

  useEffect(() => {
    let die = { width: 1000, height: 1000 };
    parseDEF(defFile).then((parsed) => {
      die = parsed;
      // Draw SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      svg
        .attr("width", 400)
        .attr("height", 400)
        .style("background", "#fafafa")
        .style("border", "1px solid #eee");

      // Scale violations to SVG
      const x = d3.scaleLinear().domain([0, die.width]).range([0, 400]);
      const y = d3.scaleLinear().domain([0, die.height]).range([0, 400]);

      // Draw die outline
      svg
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 400)
        .attr("height", 400)
        .attr("fill", "none")
        .attr("stroke", "#aaa");

      // Draw heatmap dots
      svg
        .selectAll("circle")
        .data(violations)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.x))
        .attr("cy", (d) => y(d.y))
        .attr("r", (d) =>
          d.severity === "high" ? 10 : d.severity === "medium" ? 6 : 3
        )
        .attr("fill", (d) =>
          d.severity === "high"
            ? "red"
            : d.severity === "medium"
            ? "orange"
            : "yellow"
        )
        .attr("opacity", 0.6);
    });
  }, [defFile, violations]);

  return (
    <div className="mt-6">
      <h3 className="font-bold mb-2">Hotspot Heatmap</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}