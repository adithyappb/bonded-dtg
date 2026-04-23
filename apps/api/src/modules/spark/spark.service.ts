import type { BoostRequest } from "./spark.schemas.js";
import { SparkRepository } from "./spark.repository.js";

export class SparkService {
  constructor(private readonly spark = new SparkRepository()) {}

  balance() {
    return this.spark.balance();
  }

  buyBoost(input: BoostRequest) {
    return this.spark.buyBoost(input);
  }
}
