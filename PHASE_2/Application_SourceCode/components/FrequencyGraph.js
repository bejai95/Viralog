import React from "react"
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, registerables } from 'chart.js'


function FrequencyGraph(props) {
    const options = {
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day"
            },
          }
        },
      };
    const data = {
        datasets: [
            {
                label: "Something",
                data: props.data.map((item) => ({x: new Date(item.x), y: item.y})),
            }

        ]
    }

    const points = props.data.map((item) => ({x: new Date(item.x), y: item.y}))
    console.log(points, props)
    return (
        <Line options={options} data={data} />
    )
}

export default FrequencyGraph