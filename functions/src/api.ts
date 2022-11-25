import { Request, Response, Router } from "express";
import { Firestore } from "./firestore";

export class Api {
  private router = Router();

  constructor() {
    this.router.get("/day", async (req: Request, res: Response) => {
      const measurements = await Firestore.getLast24Hours();
      const m: apiMeasurement[] = [];
      measurements.forEach((meas) => {
        const newMeas: apiMeasurement = {
          temperature: parseFloat(meas.Temperature),
          humidity: parseFloat(meas.Humidity),
          pressure: parseFloat(meas.Pressure),
          battery: parseFloat(meas.Battery),
          time: parseInt(meas.Time + "000"),
        };
        m.push(newMeas);
      });
      res.json(m);
    });
    this.router.get("/day-avg", async (req: Request, res: Response) => {
      const measurements = await Firestore.getLast24Hours();
      const m: apiMeasurement[] = [];
      const avgBy = 6;
      let counter = 0;
      let avgTemp = 0;
      let avgHum = 0;
      let avgPres = 0;
      let avgBat = 0;
      measurements.forEach((meas) => {
        avgTemp += parseFloat(meas.Temperature);
        avgHum += parseFloat(meas.Humidity);
        avgPres += parseFloat(meas.Pressure);
        avgBat += parseFloat(meas.Battery);
        counter++;
        if (counter % avgBy == 0) {
          const newMeas: apiMeasurement = {
            temperature: this.roundAvg(avgTemp, avgBy),
            humidity: this.roundAvg(avgHum, avgBy),
            pressure: this.roundAvg(avgPres, avgBy),
            battery: this.roundAvg(avgBat, avgBy),
            time: parseInt(meas.Time + "000"),
          };
          m.push(newMeas);
          avgTemp = 0;
          avgHum = 0;
          avgPres = 0;
          avgBat = 0;
        }
      });
      res.json(m);
    });
    this.router.get("/day-static", async (req: Request, res: Response) => {
      const measurements = await Firestore.getLast24HoursStatic();
      const m: apiMeasurement[] = [];
      measurements.forEach((meas) => {
        const newMeas: apiMeasurement = {
          temperature: parseFloat(meas.Temperature),
          humidity: parseFloat(meas.Humidity),
          pressure: parseFloat(meas.Pressure),
          battery: parseFloat(meas.Battery),
          time: parseInt(meas.Time + "000"),
        };
        m.push(newMeas);
      });
      res.json(m);
    });
  }

  public server(): Router {
    return this.router;
  }

  roundAvg(val: number, div: number): number {
    return Math.round((val / div) * 100) / 100;
  }
}

export interface apiMeasurement {
  temperature: number;
  humidity: number;
  pressure: number;
  battery: number;
  time: number;
}
