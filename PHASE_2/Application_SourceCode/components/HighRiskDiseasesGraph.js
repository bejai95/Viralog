import React from 'react';
import { useState } from "react";
import { BarElement, LogarithmicScale, Chart as ChartJS, LinearScale } from 'chart.js';
import {Bar} from 'react-chartjs-2';
import styles from "../styles/HighRiskDiseaseGraph.module.scss";

ChartJS.register(
  BarElement,
  LinearScale,
  LogarithmicScale,
);

export default function HighRiskDiseasesGraph( { xValues, yValues } ) {
  const [scaleType, setScaleType] = useState("linear");
  
  const data = {
    labels: xValues,
    datasets: [{
      label: "Number of reports in the past 90 days",
      data: yValues,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  };
  
  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Number of Reports in the Past 90 Days"
        },
        beginAtZero: true,
        type: scaleType,
      },
      x: {
        title: {
          display: true,
          text: "Disease Name"
        },
      },  
    }, 
  }

  function changeScale( { target }) {
    setScaleType(target.value);
  }

  return (
    <div>
      <Bar data={data} options={options} />
      <i>Graph scale type  </i> {" "}
      <select className={styles.dropdown} onChange={changeScale} defaultValue="linear">
        <option value="linear">Linear Scale</option>
        <option value="logarithmic">Logarithmic Scale</option>
      </select>
    </div>
  );
}