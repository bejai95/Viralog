import { useEffect, useState } from 'react';
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
import { randomColor } from '../utils/colours'
import SelectDiseases from '../components/SelectDiseases'
import {
    getCookie,
    setCookies,
    checkCookies,
    removeCookies,
} from "cookies-next";

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

const ComparisonGraph = ({ diseases, possibleDiseases }) => {
    var today = new Date();
    const [data, setData] = useState({})
    const [comparison, setComparison] = useState([])
    const [startDate, setStartDate] = useState(new Date().setDate(today.getDate() - 365 * 3))
    const [yMax, setYMax] = useState(0);

    useEffect(async () => {
        let reqs = comparison.map((diseaseId) =>
            fetch(`${apiurl}/diseases/` + encodeURIComponent(diseaseId) + '?weekly_reports=true')
                .then((res) => res.json())
                .then((item) => item.reports_by_week.map((item) => ({ x: new Date(item.x), y: item.y })))
                .then((item) => ({ [diseaseId]: { points: item, colour: randomColor() } }))
        );
        Promise.all(reqs)
            .then((res) => {
                let k = {}
                res.forEach(element => Object.assign(k, element));
                setData(k)
            })
    }, [comparison])

    useEffect(() => {
        setYMax(((n) => n + (n % 2 == 0 ? 4 : 5))(Math.max(...Object.values(data).map(f => f.points).flat(1).map(f => f.y))))
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
            title: {
                display: true,
                text: `Disease report comparision`,
            },
        },
    }

    const chartData = {
        datasets:
            Object.keys(data).map((diseaseId) => {
                return {
                    label: `${diseaseId} cases`,
                    data: data[diseaseId].points,
                    borderColor: data[diseaseId].colour,
                    backgroundColor: data[diseaseId].colour,
                    showLine: true,
                    lineTension: 0.4,
                    radius: 2
                }
            })
    };

    const updateTimeline = ({ target }) => {
        setStartDate(new Date().setDate(today.getDate() - target.value))
    }

    return (
        <div className={styles.container}>
            <SelectDiseases diseases={comparison} setDiseases={setComparison} allDiseases={possibleDiseases} />
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
        </div>)
}

export default ComparisonGraph