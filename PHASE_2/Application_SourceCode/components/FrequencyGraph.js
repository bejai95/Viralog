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
import apiurl from '../utils/apiconn';

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

const FrequencyGraph = ({ diseaseId }) => {
  var today = new Date();
  
  // Begin 3 years in the past
  const [data, setData] = useState([])
  const [dataPointsInRange, setDataPointsInRange] = useState(data.filter((a) => a.x >= startDate))
  const [startDate, setStartDate] = useState(new Date().setDate(today.getDate() - 365 * 3))
  const [yMax, setYMax] = useState(0);

  useEffect(() => {
    const reqUrl = `${apiurl}/diseases/` + encodeURIComponent(diseaseId) + '?weekly_reports=true';
    fetch(reqUrl)
      .then((res) => res.json())
      .then((item) => item.reports_by_week.map((item) => ({x: new Date(item.x), y: item.y})))
      .then((d) => setData(d))
  }, [])

  useEffect(() => {
    const filtered = data.filter((a) => a.x >= startDate)

    setYMax(((n) => n + (n % 2 == 0 ? 4 : 5))(Math.max(...filtered.map((item) => item.y))))
    setDataPointsInRange(filtered)
  }, [startDate, data])

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Cases"
        },
        min: 0,
        max: yMax
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
        },
        min: startDate
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${diseaseId} reports per week`,
      },
    },
  }

  const chartData = {
    datasets: [
      {
        label: `${diseaseId} cases`,
        data: dataPointsInRange,
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