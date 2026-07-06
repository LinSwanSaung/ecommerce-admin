import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProductFormDialog } from "./product-form-dialog";

// Server Actions can't run in jsdom; these tests only exercise client-side
// validation, which fails before the actions are ever called.
vi.mock("@/lib/product-actions", () => ({
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

function renderDialog() {
  return render(<ProductFormDialog open onOpenChange={vi.fn()} product={null} />);
}

describe("ProductFormDialog", () => {
  it("shows every required-field message when submitted empty", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Add product" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("SKU is required")).toBeInTheDocument();
    expect(screen.getByText("Category is required")).toBeInTheDocument();
    expect(screen.getByText("Price is required")).toBeInTheDocument();
    expect(screen.getByText("Stock is required")).toBeInTheDocument();
    expect(screen.getByText("Status is required")).toBeInTheDocument();
  });

  it("rejects a price of zero", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText("Price ($)"), "0");
    await user.click(screen.getByRole("button", { name: "Add product" }));

    expect(
      await screen.findByText("Price must be greater than 0"),
    ).toBeInTheDocument();
  });
});
