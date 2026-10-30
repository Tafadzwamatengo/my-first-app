import { ResponsiveBar } from "@nivo/bar";
import "./App.css";

const data = [
  { habitat: "Villages", density: 2.16 },
  { habitat: "Fields", density: 1.13 },
  { habitat: "Plains", density: 0.96 },
  { habitat: "Rock outcrops", density: 0.83 },
];

export default function App() {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={data}
        keys={["density"]}
        indexBy="habitat"
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        padding={0.3}
        colors={{ scheme: "greys" }}
        axisBottom={{ legend: "Land-use type", legendPosition: "middle", legendOffset: 40 }}
        axisLeft={{ legend: "Plants/ha", legendPosition: "middle", legendOffset: -45 }}
      />
    </div>
  );
}