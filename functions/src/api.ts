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
          time: parseInt(meas.Time),
        };
        m.push(newMeas);
      });
      res.json(m);
    });
  }

  public server(): Router {
    return this.router;
  }
}

export interface apiMeasurement {
  temperature: number;
  humidity: number;
  pressure: number;
  battery: number;
  time: number;
}
