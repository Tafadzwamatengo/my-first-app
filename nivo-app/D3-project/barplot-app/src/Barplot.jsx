import * as d3 from "d3";

const MARGIN = { top: 10, right: 30, bottom: 10, left: 110 };

export const Barplot = ({ data, width = 500, height = 400 }) => {
  // Size of the drawing area inside the margins
  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Sort so the biggest bar is at the top
  const sortedData = [...data].sort((a, b) => b.students - a.students);

  // Y scale: one band (row) per country
  const yScale = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.country))
    .range([0, boundsHeight])
    .padding(0.15);

  // X scale: number of students -> pixel width
  const maxStudents = d3.max(sortedData, (d) => d.students) ?? 0;
  const xScale = d3
    .scaleLinear()
    .domain([0, maxStudents])
    .range([0, boundsWidth]);

  // One bar + two labels per country
  const bars = sortedData.map((d) => {
    const y = yScale(d.country);
    if (y === undefined) return null;
    const barWidth = xScale(d.students);
    const middleY = y + yScale.bandwidth() / 2;

    return (
      <g key={d.country}>
        <rect
          x={0}
          y={y}
          width={barWidth}
          height={yScale.bandwidth()}
          fill="#595959"
        />
        <text
          x={-6}
          y={middleY}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={11}
          fill="#262626"
        >
          {d.country}
        </text>
        <text
          x={barWidth + 4}
          y={middleY}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={10}
          fill="#7F7F7F"
        >
          {d.students}
        </text>
      </g>
    );
  });

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>{bars}</g>
    </svg>
  );
};