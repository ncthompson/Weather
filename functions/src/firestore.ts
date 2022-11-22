import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// bietsbot-firebase.json in the root directory of the project
const CUSTOM_SERVICE_ACCOUNT = path.resolve(__dirname, "../../bietsbot-firebase.json");

if (fs.existsSync(CUSTOM_SERVICE_ACCOUNT)) {
  // If custom service account exists in expected place, use it
  console.log(`Using custom service account: ${CUSTOM_SERVICE_ACCOUNT}`);
  admin.initializeApp({ credential: admin.credential.cert(CUSTOM_SERVICE_ACCOUNT) });
} else {
  // If no custom service account exists this is deployed on GCP and googles sets it for us
  admin.initializeApp();
}

const db = admin.firestore();
const weatherCol = db.collection("weather_stations");

export class Firestore {
  static async getLast24Hours(): Promise<Measurement[]> {
    const now = Date.now() / 1000;
    const nowMin24h = now - (24 * 60 * 60 + 60);
    const last24h = await weatherCol.where("Time", ">", nowMin24h.toFixed(0)).get();
    const res: Measurement[] = [];
    last24h.forEach((entry) => {
      res.push(entry.data() as Measurement);
    });
    return res;
  }

  static async getLast24HoursAlt(): Promise<Measurement[]> {
    const now = Date.now() / 1000;
    const nowMin24h = now - (24 * 60 * 60 + 60);
    const last24h = await weatherCol.where(admin.firestore.FieldPath.documentId(), ">", nowMin24h.toFixed(0)).get();
    const res: Measurement[] = [];
    last24h.forEach((entry) => {
      res.push(entry.data() as Measurement);
    });
    return res;
  }
}

export interface Measurement {
  Temperature: string;
  Humidity: string;
  Pressure: string;
  Battery: string;
  Time: string;
}
