// Run with: npm run ts ./examples/print-last24.ts

import { Firestore } from "../src/firestore";

async function printResults() {
  console.log("Starting");

  const measurements = await Firestore.getLast24HoursAlt();

  for (const m of measurements) {
    console.log(m);
  }
  console.log("Length");

  console.log(measurements.length);
}

printResults();
