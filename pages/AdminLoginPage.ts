import type { Locator, Page } from "@playwright/test";

export class AdminLoginPage {
  private readonly page: Page;
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.locator("#input-username");
    this.passwordField = page.locator("#input-password");
    this.loginButton = page.locator('button[type="submit"]');
  }

  async open(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  async isAuthenticated(): Promise<boolean> {
    await this.page.locator("#menu-customer").waitFor({ state: "visible" });
    return this.page.locator("#menu-customer").isVisible();
  }
}
