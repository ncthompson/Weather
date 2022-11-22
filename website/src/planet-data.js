export const planetChartData = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperature",
        data: [],
        backgroundColor: "rgba(54,73,93,.5)",
        borderColor: "#36495d",
        borderWidth: 3,
      },
    ],
  },
  options: {
    responsive: true,
    lineTension: 1,
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            displayFormats: {
              minutes: "HH:mm:ss",
            },
          },
        },
      ],
    },
  },
};

export default planetChartData;
