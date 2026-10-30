import { ResponsiveBar } from "@nivo/bar";

const data = [
  { country: "France", value: 42 },
  { country: "Germany", value: 35 },
  { country: "Spain", value: 28 },
  { country: "Italy", value: 31 },
  { country: "UK", value: 22 },
];

export const Barplot = () => {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="country"
      />
    </div>
  );
}

export default App;