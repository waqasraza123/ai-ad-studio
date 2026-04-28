import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createElement } from "react"
import { describe, expect, it, vi } from "vitest"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"

describe("FormSubmitButton", () => {
  it("shows the shared pending loader while the parent form action is running", async () => {
    const action = vi.fn(() => new Promise<never>(() => {}))
    const user = userEvent.setup()

    render(
      createElement(
        "form",
        { action },
        createElement(FormSubmitButton, {
          children: "Save",
          pendingLabel: "Saving"
        })
      )
    )

    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(await screen.findByRole("button", { name: "Saving" })).toHaveAttribute(
      "aria-busy",
      "true"
    )
    expect(action).toHaveBeenCalledTimes(1)
  })
})
