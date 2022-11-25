<template>
  <div id="app">
    <WeatherChart />
  </div>
</template>

<script>
import WeatherChart from "./components/WeatherChart.vue";

export default {
  name: "App",
  components: {
    WeatherChart,
  },
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
