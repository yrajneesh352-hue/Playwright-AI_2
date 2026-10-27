import type { Locator, Page } from "@playwright/test";

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly quantityField: Locator;
  private readonly addToCartButton: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with product form controls.
    this.quantityField = page.locator('input[name="quantity"]');
    this.addToCartButton = page.getByRole("button", { name: /add to cart/i });
    this.successMessage = page.locator(".alert-success");
  }

  /**
   * Checks that the requested product details are displayed.
   * @param productName - Expected product name
   * @returns Whether the product heading is visible
   */
  async isProductVisible(productName: string): Promise<boolean> {
    const productHeading = this.page.getByRole("heading", {
      name: productName,
      exact: true,
    });
    await productHeading.waitFor({ state: "visible" });
    return productHeading.isVisible();
  }

  /**
   * Sets the quantity to add to the cart.
   * @param quantity - Positive product quantity
   */
  async setQuantity(quantity: number): Promise<void> {
    await this.quantityField.fill(String(quantity));
  }

  /**
   * Returns the displayed product price.
   * @returns Product price text
   */
  async getDisplayedPrice(): Promise<string> {
    const priceList = this.page
      .locator("#content .list-unstyled")
      .filter({ hasText: /ex tax/i })
      .first();
    if (await priceList.count()) {
      return (await priceList.locator("li").first().innerText()).trim();
    }

    return (await this.page.locator("#content h2").first().innerText()).trim();
  }

  /**
   * Adds the displayed product to the shopping cart.
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  /**
   * Returns the add-to-cart confirmation text.
   * @returns Confirmation text
   */
  async getAddToCartMessage(): Promise<string> {
    await this.successMessage.waitFor({ state: "visible" });
    return this.successMessage.innerText();
  }
}
