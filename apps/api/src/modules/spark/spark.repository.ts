import { randomUUID } from "node:crypto";
import { demoSpark } from "../demo-data.js";
import type { BoostRequest } from "./spark.schemas.js";

export class SparkRepository {
  balance() {
    return demoSpark;
  }

  buyBoost(input: BoostRequest) {
    return {
      id: randomUUID(),
      ...input,
      status: "active",
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    };
  }
}
