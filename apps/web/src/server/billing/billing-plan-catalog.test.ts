import { describe, expect, it } from "vitest"
import {
  BillingPlanCatalogError,
  BILLING_PHASE_34_MIGRATION,
  createBillingPlanCatalogError,
  isBillingPlanCatalogError
} from "./billing-plan-catalog"

describe("billing plan catalog errors", () => {
  it("classifies missing billing plan columns as schema drift", () => {
    const error = createBillingPlanCatalogError("list billing plans", {
      code: "42703",
      message: "column billing_plans.allow_activation_packages does not exist"
    })

    expect(error).toBeInstanceOf(BillingPlanCatalogError)
    expect(isBillingPlanCatalogError(error)).toBe(true)
    expect(error.code).toBe("schema_drift")
    expect(error.postgresCode).toBe("42703")
    expect(error.message).toContain(BILLING_PHASE_34_MIGRATION)
  })

  it("classifies other failures as query failures", () => {
    const error = createBillingPlanCatalogError("list billing plans", {
      code: "PGRST301",
      message: "permission denied"
    })

    expect(error.code).toBe("query_failed")
    expect(error.postgresCode).toBe("PGRST301")
    expect(error.message).toContain("permission denied")
  })
})
