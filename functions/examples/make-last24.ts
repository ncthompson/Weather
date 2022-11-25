// Run with: npm run ts ./examples/print-last24.ts

import { Firestore, Measurement } from "../src/firestore";

async function printResults() {
  console.log("Starting");

  const measurements = await Firestore.getLast24HoursAlt();

  const subMeasure: Measurement[] = [];

  const avgBy = 6;
  let counter = 0;
  let avgTemp = 0;
  let avgHum = 0;
  let avgPres = 0;
  let avgBat = 0;

  for (const m of measurements) {
    avgTemp += parseFloat(m.Temperature);
    avgHum += parseFloat(m.Humidity);
    avgPres += parseFloat(m.Pressure);
    avgBat += parseFloat(m.Battery);
    counter++;

    if (counter % avgBy == 0) {
      const avgMeas: Measurement = {
        Temperature: (avgTemp / avgBy).toString(),
        Humidity: (avgHum / avgBy).toString(),
        Pressure: (avgPres / avgBy).toString(),
        Battery: (avgBat / avgBy).toString(),
        Time: m.Time,
      };
      subMeasure.push(avgMeas);
      avgTemp = 0;
      avgHum = 0;
      avgPres = 0;
      avgBat = 0;
    }
    console.log(m);
  }
  console.log("Length");

  console.log(subMeasure.length);
  Firestore.create24Collection(subMeasure);
}

printResults();
