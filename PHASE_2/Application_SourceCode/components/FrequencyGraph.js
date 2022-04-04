import {useEffect, useState} from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-moment';
import { Line } from 'react-chartjs-2';
import styles from "../styles/FrequencyGraph.module.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const FrequencyGraph = ({data, diseaseId}) => {
  var today = new Date();
  const baseOptions = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Cases"
        },
        min: 0
      },
      x: {
        type: "time",
        distribution: "linear",

        time: {
          parser: "yyyy-MM-dd",
          unit: "week"
        },
        title: {
          display: true,
          text: "Date"
        },
        gridLines: {
          display: false
        }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${diseaseId} reports per week`,
      },
    },
  };
  
  // Begin 3 years in the past
  const [startDate, setStartDate] = useState(new Date().setDate(today.getDate() - 365 * 3))
  const [dataPoints, setDataPoints] = useState(data.filter((a) => a.x >= startDate))
  const [options] = useState(baseOptions)
  

  const chartData = {
    datasets: [
      {
        label: `${diseaseId} cases`,
        data: dataPoints,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        showLine: true,
        lineTension: 0.4,
        radius: 2
      },
    ],
  };
  const updateTimeline = ({target}) => {
    setStartDate(new Date().setDate(today.getDate() - target.value))
  }

  useEffect(() => {
    const filtered = data.filter((a) => a.x >= startDate)
    // Make max scale an even number with buffer above max
    options.scales.y.max = ((n) => n + (n % 2 == 0 ? 4 : 5))(Math.max(...filtered.map((item) => item.y)))
    options.scales.x.min = startDate
    setDataPoints(filtered)
  }, [startDate])

  return (
    <div className={styles.container}>
      <Line options={options} data={chartData} />
      <i>See reports from previous </i> {" "}
      <select className={styles.dropdown} onChange={updateTimeline} defaultValue={365 * 3}>
        <option value={30}>1 month</option>
        <option value={60}>2 months</option>
        <option value={90}>3 months</option>
        <option value={180}>6 months</option>
        <option value={365}>1 year</option>
        <option value={365 * 2}>2 years</option>
        <option value={365 * 3}>3 years</option>
        <option value={365 * 5}>5 years</option>
      </select>
    </div> 
  )
}

export default FrequencyGraph