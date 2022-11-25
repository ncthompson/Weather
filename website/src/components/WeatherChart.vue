<template>
  <div>
    <canvas id="weather-chart"></canvas>
    <!-- <canvas id="weather-humidity"></canvas> -->
  </div>
</template>

<script>
import Chart from "chart.js";
// import mockData from "../temp-data.json";

export default {
  name: "WeatherChart",
  data() {
    return {
      weatherData: {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Temperature °C",
              backgroundColor: "rgba(224,89,79,.25)",
              borderColor: "#db382c",
              borderWidth: 4,
              radius: 2,
            },
            {
              label: "Relative Humidity %",
              backgroundColor: "rgba(68,89,171,.25)",
              borderColor: "#2b45ad",
              borderWidth: 4,
              radius: 2,
              yAxisID: "humidity",
            },
            {
              label: "Air Pressure Pa",
              backgroundColor: "rgba(32,133,27,.25)",
              borderColor: "#20851b",
              borderWidth: 4,
              radius: 2,
              yAxisID: "pressure",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          lineTension: 0.8,
          scales: {
            y: {
              seriesName: "Temperature",
            },
            yAxes: [
              {
                seriesName: "Temperature",
                title: {
                  text: "Temperature °C",
                  style: {
                    color: "#db382c",
                  },
                },
              },
              {
                seriesName: "Humidity",
                id: "humidity",
                title: {
                  text: "Humidity °C",
                  style: {
                    color: "#2b45ad",
                  },
                },
              },
              {
                seriesName: "Pressure",
                id: "pressure",
                position: "right",
                title: {
                  text: "Pressure",
                  style: {
                    color: "#2b45ad",
                  },
                },
              },
            ],
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
      },
    };
  },
  async mounted() {
    this.loaded = false;
    try {
      const ctx = document.getElementById("weather-chart");

      const resp = await fetch(
        "https://us-central1-bietsbot.cloudfunctions.net/httpServer/day-avg"
      );
      const dayData = await resp.json();
      // const dayData = mockData;
      const timeSeries = dayData.map((a) => a.time);
      const temperatureSeries = dayData.map((a) => a.temperature);
      const humiditySeries = dayData.map((a) => a.humidity);
      const pressureSeries = dayData.map((a) => a.pressure);

      this.weatherData.data.labels = timeSeries;
      this.weatherData.data.datasets[0].data = temperatureSeries;
      this.weatherData.data.datasets[1].data = humiditySeries;
      this.weatherData.data.datasets[2].data = pressureSeries;

      new Chart(ctx, this.weatherData);
      this.loaded = true;
    } catch (e) {
      console.error(e);
    }
  },
};
</script>
