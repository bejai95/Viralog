import React from 'react';
import { BarElement, LogarithmicScale, Chart as ChartJS } from 'chart.js';
import {Bar} from 'react-chartjs-2';

ChartJS.register(
  BarElement,
  LogarithmicScale,
);

export default function HighRiskDiseasesGraph( { xValues, yValues } ) {
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
        //type: 'logarithmic',
      },
      x: {
        title: {
          display: true,
          text: "Disease Name"
        },
      },  
    }, 
  }

  return (
    <div>
      <Bar data={data} options={options} />
    </div>
  );
}