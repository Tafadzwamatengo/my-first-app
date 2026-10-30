import { useState } from "react";
import * as d3 from "d3";
import { animated, useSpring } from "@react-spring/web";

const MARGIN = { top: 34, right: 70, bottom: 46, left: 120 };

const CHART_TYPES = [
  { id: "bar", label: "Barplot", subtitle: "Each bar shows the number of students per country." },
  { id: "lollipop", label: "Lollipop", subtitle: "Same data with less ink: the dot marks each value." },
  { id: "dumbbell", label: "Dumbbell", subtitle: "How far each country sits from the average." },
];

const COLORS = {
  text: "#262626",
  muted: "#7F7F7F",
  bar: "#404040",
  above: "#262626",
  below: "#A6A6A6",
  grid: "#EDEDED",
};

const flagUrl = (code) => `https://flagcdn.com/w80/${code}.png`;

// ---------- One row (one country). All shapes morph between chart types ----------
const Row = ({ d, index, type, xScale, y, bandwidth, mean, dimmed, onEnter, onLeave }) => {
  const mid = y + bandwidth / 2;
  const xVal = xScale(d.students);
  const xMean = xScale(mean);
  const isBar = type === "bar";
  const isDumbbell = type === "dumbbell";
  const above = d.students >= mean;

  // Shape positions: animated with a small delay per row (staggered effect)
  const shape = useSpring({
    from: { rectW: 0, labelX: 6 },
    to: {
      rectX: isDumbbell ? Math.min(xVal, xMean) : 0,
      rectW: isDumbbell ? Math.abs(xVal - xMean) : xVal,
      rectY: isBar ? y : mid - 1,
      rectH: isBar ? bandwidth : 2,
      dotR: type === "lollipop" ? 6 : 0,
      flagR: isDumbbell ? 10 : 0,
      meanR: isDumbbell ? 4 : 0,
      labelX: isDumbbell ? Math.max(xVal, xMean) + 16 : xVal + (isBar ? 6 : 12),
    },
    delay: index * 30,
    config: { tension: 180, friction: 24 },
  });

  // Fade for hover highlight: no delay, so it reacts instantly
  const fade = useSpring({ opacity: dimmed ? 0.2 : 1, config: { duration: 150 } });

  const stickColor = isBar ? COLORS.bar : isDumbbell ? (above ? COLORS.above : COLORS.below) : COLORS.muted;

  return (
    <animated.g style={fade} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {/* invisible full-width hit area, so hovering anywhere on the row works */}
      <rect x={-MARGIN.left} y={y} width={xScale.range()[1] + MARGIN.left + MARGIN.right} height={bandwidth} fill="transparent" />

      {/* country label */}
      <text x={-10} y={mid} textAnchor="end" dominantBaseline="middle" fontSize={12} fill={COLORS.text}>
        {d.country}
      </text>

      {/* bar (bar mode) / stick (lollipop & dumbbell) */}
      <animated.rect
        x={shape.rectX}
        y={shape.rectY}
        width={shape.rectW}
        height={shape.rectH}
        rx={1}
        fill={stickColor}
      />

      {/* average end of the dumbbell (hollow dot) */}
      <animated.circle cx={xMean} cy={mid} r={shape.meanR} fill="#FFFFFF" stroke={COLORS.muted} strokeWidth={1.5} />

      {/* lollipop head */}
      <animated.circle cx={xVal} cy={mid} r={shape.dotR} fill={COLORS.text} />

      {/* flag (dumbbell mode): grey disc behind it in case the image does not load */}
      <animated.circle cx={xVal} cy={mid} r={shape.flagR} fill="#D9D9D9" />
      <animated.image
        href={flagUrl(d.code)}
        x={shape.flagR.to((r) => xVal - r)}
        y={shape.flagR.to((r) => mid - r)}
        width={shape.flagR.to((r) => r * 2)}
        height={shape.flagR.to((r) => r * 2)}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#flag-circle)"
      />
      <animated.circle cx={xVal} cy={mid} r={shape.flagR} fill="none" stroke="#FFFFFF" strokeWidth={1.5} />

      {/* value label */}
      <animated.text x={shape.labelX} y={mid} dominantBaseline="middle" fontSize={11} fill={COLORS.muted}>
        {d.students}
      </animated.text>
    </animated.g>
  );
};

// ---------- Main component ----------
export const ChartSwitcher = ({ data, width = 640, height = 560 }) => {
  const [type, setType] = useState("bar");
  const [hovered, setHovered] = useState(null);

  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const sorted = [...data].sort((a, b) => b.students - a.students);
  const mean = d3.mean(sorted, (d) => d.students);

  // D3 is used ONLY for the maths (scales)
  const yScale = d3.scaleBand().domain(sorted.map((d) => d.country)).range([0, boundsHeight]).padding(0.2);
  const xScale = d3.scaleLinear().domain([0, d3.max(sorted, (d) => d.students)]).range([0, boundsWidth]).nice();

  const activeIndex = CHART_TYPES.findIndex((c) => c.id === type);
  const hoveredRow = sorted.find((d) => d.country === hovered);

  // Tooltip sits right of the row, or flips to the left if it would leave the card
  const rowEnd = hoveredRow ? MARGIN.left + Math.max(xScale(hoveredRow.students), xScale(mean)) : 0;
  const tooltipLeft = rowEnd + 40 + 170 > width ? rowEnd - 200 : rowEnd + 40;

  // Average line: only visible in dumbbell mode
  const meanLine = useSpring({ opacity: type === "dumbbell" ? 1 : 0, config: { duration: 400 } });

  return (
    <div className="card">
      <h2 className="title">Students per country</h2>
      <p className="subtitle">
        {CHART_TYPES[activeIndex].subtitle}
        {type === "dumbbell" && ` Average = ${mean.toFixed(1)} students.`}
      </p>

      {/* selector with sliding highlight */}
      <div className="selector">
        <div className="selector-pill" style={{ transform: `translateX(${activeIndex * 100}%)` }} />
        {CHART_TYPES.map((c) => (
          <button key={c.id} className={c.id === type ? "active" : ""} onClick={() => setType(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <svg width={width} height={height}>
          <defs>
            {/* objectBoundingBox = circle fits whatever box the flag image has */}
            <clipPath id="flag-circle" clipPathUnits="objectBoundingBox">
              <circle cx={0.5} cy={0.5} r={0.5} />
            </clipPath>
          </defs>

          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* vertical grid lines + x-axis tick labels */}
            {xScale.ticks(7).map((tick) => (
              <g key={tick}>
                <line x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={boundsHeight} stroke={COLORS.grid} />
                <text x={xScale(tick)} y={boundsHeight + 18} textAnchor="middle" fontSize={10} fill={COLORS.muted}>
                  {tick}
                </text>
              </g>
            ))}
            <text x={boundsWidth / 2} y={boundsHeight + 38} textAnchor="middle" fontSize={11} fill={COLORS.muted}>
              Number of students
            </text>

            {/* average line */}
            <animated.g style={meanLine}>
              <line x1={xScale(mean)} x2={xScale(mean)} y1={-8} y2={boundsHeight} stroke={COLORS.muted} strokeDasharray="4 4" />
              <text x={xScale(mean)} y={-14} textAnchor="middle" fontSize={10} fill={COLORS.muted}>
                Average {mean.toFixed(1)}
              </text>
            </animated.g>

            {sorted.map((d, i) => (
              <Row
                key={d.country}
                d={d}
                index={i}
                type={type}
                xScale={xScale}
                y={yScale(d.country)}
                bandwidth={yScale.bandwidth()}
                mean={mean}
                dimmed={hovered !== null && hovered !== d.country}
                onEnter={() => setHovered(d.country)}
                onLeave={() => setHovered(null)}
              />
            ))}
          </g>
        </svg>

        {/* tooltip */}
        {hoveredRow && (
          <div
            className="tooltip"
            style={{
              left: tooltipLeft,
              top: MARGIN.top + yScale(hoveredRow.country) - 10,
            }}
          >
            <img src={flagUrl(hoveredRow.code)} alt="" />
            <div>
              <strong>{hoveredRow.country}</strong>
              <div>{hoveredRow.students} students</div>
              <div className="diff">
                {hoveredRow.students >= mean ? "+" : "−"}
                {Math.abs(hoveredRow.students - mean).toFixed(1)} vs average
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
