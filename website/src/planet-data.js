export const planetChartData = {
  type: "line",
  data: {
    labels: [
      1669013331, 1669013632, 1669013931, 1669014231, 1669014531, 1669014831,
      1669015131, 1669015431,
    ],
    datasets: [
      {
        label: "Number of Moons",
        data: [0, 0, 1, 2, 79, 82, 27, 134],
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
