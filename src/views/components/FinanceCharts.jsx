import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
);
export default function FinanceCharts({
  chartType,
  chartDataConfig,
  chartOptions
}) {
  return (
    <div className="relative h-60 w-full">
      {chartType === 'line' ? (
        <Line data={chartDataConfig} options={chartOptions} />
      ) : (
        <Bar data={chartDataConfig} options={chartOptions} />
      )}
    </div>
  );
}
