import type { CheckoutRequest } from "./billing.schemas.js";
import { BillingRepository } from "./billing.repository.js";

export class BillingService {
  constructor(private readonly billing = new BillingRepository()) {}

  plans() {
    return {
      plans: this.billing.plans()
    };
  }

  status() {
    return this.billing.status();
  }

  checkout(input: CheckoutRequest) {
    return this.billing.checkout(input);
  }
}
