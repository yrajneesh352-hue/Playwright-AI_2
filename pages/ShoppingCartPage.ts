import type { Locator, Page } from "@playwright/test";

export class ShoppingCartPage {
  private readonly page: Page;

  // Locators
  private readonly cartHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names.
    this.cartHeading = page.getByRole("heading", { name: /shopping cart/i });
  }

  /**
   * Checks that the shopping cart page is displayed.
   * @returns Whether the cart heading is visible
   */
  async isCartVisible(): Promise<boolean> {
    await this.cartHeading.waitFor({ state: "visible" });
    return this.cartHeading.isVisible();
  }

  /**
   * Checks whether the named product is present in the cart.
   * @param productName - Product name to find
   * @returns Whether the product row is visible
   */
  async hasProduct(productName: string): Promise<boolean> {
    return this.productRow(productName).isVisible();
  }

  /**
   * Reads the quantity for the named cart product.
   * @param productName - Product name to find
   * @returns The quantity in the cart
   */
  async getQuantity(productName: string): Promise<string> {
    return this.productRow(productName)
      .locator('input[name^="quantity"]')
      .inputValue();
  }

  /**
   * Reads the product's unit price from its cart row.
   * @param productName - Product name to find
   * @returns The displayed unit price
   */
  async getUnitPrice(productName: string): Promise<string> {
    return this.productRow(productName).getByRole("cell").nth(4).innerText();
  }

  /**
   * Reads the product's line total from its cart row.
   * @param productName - Product name to find
   * @returns The displayed line total
   */
  async getLineTotal(productName: string): Promise<string> {
    return this.productRow(productName).getByRole("cell").nth(5).innerText();
  }

  /**
   * Reads the total from the cart totals table.
   * @returns The displayed cart total
   */
  async getCartTotal(): Promise<string> {
    const totalRow = this.page
      .getByRole("row")
      .filter({ has: this.page.getByText(/^Total:?$/i) })
      .last();
    return totalRow.getByRole("cell").last().innerText();
  }

  /**
   * Finds the cart table row containing a product name.
   * @param productName - Product name to match
   * @returns The matching cart row
   */
  private productRow(productName: string): Locator {
    return this.page.getByRole("row").filter({ hasText: productName }).first();
  }
}
