import type { Locator, Page } from "@playwright/test";

export class LogoutPage {
  private readonly page: Page;

  // Locators
  private readonly logoutHeading: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names.
    this.logoutHeading = page.getByRole("heading", { name: /account logout/i });
    this.continueButton = page.getByRole("link", { name: /^continue$/i });
  }

  /**
   * Checks that the logout confirmation page is displayed.
   * @returns Whether the logout heading is visible
   */
  async isLogoutConfirmationVisible(): Promise<boolean> {
    await this.logoutHeading.waitFor({ state: "visible" });
    return this.logoutHeading.isVisible();
  }

  /**
   * Returns to the storefront after logout.
   */
  async continueToStorefront(): Promise<void> {
    await this.continueButton.click();
  }
}
