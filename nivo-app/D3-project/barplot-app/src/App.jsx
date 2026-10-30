import { ChartSwitcher } from "./ChartSwitcher";
import { data } from "./data";
import "./App.css";

export default function App() {
  return (
    <main className="page">
      <ChartSwitcher data={data} width={640} height={560} />
    </main>
  );
}
