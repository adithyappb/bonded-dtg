import { randomUUID } from "node:crypto";
import type { CheckoutRequest } from "./billing.schemas.js";

const plans = [
  { id: "premium_monthly", label: "Premium Monthly", amountWei: "9000000000000000", interval: "month" },
  { id: "premium_yearly", label: "Premium Yearly", amountWei: "90000000000000000", interval: "year" }
];

export class BillingRepository {
  plans() {
    return plans;
  }

  status() {
    return {
      premium: false,
      currentPlan: null,
      renewsAt: null
    };
  }

  checkout(input: CheckoutRequest) {
    const plan = plans.find((candidate) => candidate.id === input.planId) ?? plans[0];
    return {
      id: randomUUID(),
      plan,
      chainId: input.chainId,
      status: "requires_payment"
    };
  }
}
