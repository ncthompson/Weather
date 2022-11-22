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
          temperature: meas.Temperature,
          humidity: meas.Humidity,
          pressure: meas.Pressure,
          battery: meas.Battery,
          time: meas.Time,
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
  temperature: string;
  humidity: string;
  pressure: string;
  battery: string;
  time: string;
}
