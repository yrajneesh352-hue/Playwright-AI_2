import type { Locator, Page } from "@playwright/test";

export class AccountPage {
  private readonly page: Page;

  // Locators
  private readonly accountHeading: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names.
    this.accountHeading = page
      .locator("#content")
      .getByRole("heading", { name: /^my account$/i });
    this.logoutLink = page.getByRole("link", { name: /^logout$/i }).first();
  }

  /**
   * Checks that the authenticated My Account dashboard is displayed.
   * @returns Whether the account heading is visible
   */
  async isDashboardVisible(): Promise<boolean> {
    await this.accountHeading.waitFor({ state: "visible" });
    return this.accountHeading.isVisible();
  }

  /**
   * Navigates to the customer logout confirmation.
   */
  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
