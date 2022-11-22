import * as functions from "firebase-functions";
import express from "express";
import {Server} from "./server";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const server = new Server();
const expressServer = express();
expressServer.use("/", server.server());
export const httpServer = functions.https.onRequest(expressServer);
