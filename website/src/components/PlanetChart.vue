<template>
  <div>
    <canvas id="planet-chart"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js";
import planetChartData from "../planet-data.js";

export default {
  name: "PlanetChart",
  data() {
    return {
      planetChartData: planetChartData,
    };
  },
  async mounted() {
    this.loaded = false;

    try {
      const ctx = document.getElementById("planet-chart");
      const resp = await fetch(
        "https://us-central1-bietsbot.cloudfunctions.net/httpServer/day"
      );
      const dayData = await resp.json();
      const timeSeries = dayData.map((a) => a.time);
      const dataSeries = dayData.map((a) => a.temperature);
      this.planetChartData.data.labels = timeSeries;
      this.planetChartData.data.datasets[0].data = dataSeries;
      new Chart(ctx, this.planetChartData);
      this.loaded = true;
    } catch (e) {
      console.error(e);
    }
  },
};
</script>

<!-- 
export default {
    name: 'BarChart',
    components: { Bar },
    data: () => ({
      loaded: false,
      chartData: null
    }),
    async mounted () {
      this.loaded = false
  
      try {
        const { userlist } = await fetch('/api/userlist')
        this.chartdata = userlist
  
        this.loaded = true
      } catch (e) {
        console.error(e)
      }
    }
  } -->
