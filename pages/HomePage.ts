import type { Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly accountNavigation: Locator;
  private readonly accountMenu: Locator;
  private readonly searchField: Locator;
  private readonly searchButton: Locator;
  private readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names.
    this.accountNavigation = page.getByRole("navigation").first();
    this.accountMenu = this.accountNavigation
      .getByRole("link", { name: /my account/i })
      .first();
    this.searchField = page.getByPlaceholder(/search/i);
    this.searchButton = page.locator("#search").getByRole("button");
    this.shoppingCartLink = this.accountNavigation.getByRole("link", {
      name: /shopping cart/i,
    });
  }

  /**
   * Opens the My Account menu.
   */
  async openAccountMenu(): Promise<void> {
    await this.accountMenu.click();
  }

  /**
   * Navigates to customer registration.
   */
  async goToRegistration(): Promise<void> {
    await this.openAccountMenu();
    await this.accountNavigation.getByRole("link", { name: /^register$/i }).click();
  }

  /**
   * Navigates to customer login.
   */
  async goToLogin(): Promise<void> {
    await this.openAccountMenu();
    await this.accountNavigation.getByRole("link", { name: /^login$/i }).click();
  }

  /**
   * Navigates to the authenticated customer's account dashboard.
   */
  async goToAccount(): Promise<void> {
    await this.openAccountMenu();
    await this.accountNavigation.getByRole("link", { name: /^my account$/i }).click();
  }

  /**
   * Searches the storefront for a product.
   * @param productName - Product name to search for
   */
  async searchFor(productName: string): Promise<void> {
    await this.searchField.fill(productName);
    await this.searchButton.click();
  }

  /**
   * Opens the shopping cart.
   */
  async openShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /**
   * Checks whether the logout option is displayed in the account menu.
   * @returns Whether a logout option is visible
   */
  async isLogoutOptionVisible(): Promise<boolean> {
    await this.openAccountMenu();
    return this.accountNavigation.getByRole("link", { name: /^logout$/i }).isVisible();
  }
}
