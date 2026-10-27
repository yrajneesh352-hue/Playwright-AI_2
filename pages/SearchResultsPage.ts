import type { Locator, Page } from "@playwright/test";

export class SearchResultsPage {
  private readonly page: Page;

  // Locators
  private readonly resultsHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names.
    this.resultsHeading = page.getByRole("heading", { name: /^search - /i });
  }

  /**
   * Checks that the search results page is displayed.
   * @returns Whether the results heading is visible
   */
  async isResultsPageVisible(): Promise<boolean> {
    await this.resultsHeading.waitFor({ state: "visible" });
    return this.resultsHeading.isVisible();
  }

  /**
   * Checks whether a product is present in the search results.
   * @param productName - Product to find
   * @returns Whether the product link is visible
   */
  async hasProduct(productName: string): Promise<boolean> {
    return this.productLink(productName).isVisible();
  }

  /**
   * Opens a product from the search results.
   * @param productName - Product to open
   */
  async openProduct(productName: string): Promise<void> {
    await this.productLink(productName).click();
  }

  /**
   * Returns the matching product link.
   * @param productName - Product name to match
   * @returns A locator for the product link
   */
  private productLink(productName: string): Locator {
    return this.page
      .getByRole("heading", { name: productName, exact: true })
      .getByRole("link", { name: productName, exact: true });
  }
}
