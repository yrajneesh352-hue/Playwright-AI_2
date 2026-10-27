import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly emailField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly warningMessage: Locator;
  private readonly errorMessage: Locator;
  private readonly invalidInputs: Locator;
  private readonly returningCustomerHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names.
    this.emailField = page.getByLabel(/e-?mail/i);
    this.passwordField = page.getByLabel(/^password$/i);
    this.loginButton = page.getByRole("button", { name: /^login$/i });
    this.warningMessage = page.getByText(
      /warning: no match for e-mail address and\/or password\./i,
    );
    this.errorMessage = page.locator(".alert-danger");
    this.invalidInputs = page.locator("input:invalid");
    this.returningCustomerHeading = page.getByRole("heading", {
      name: /^returning customer$/i,
    });
  }

  /**
   * Checks that the customer login page is displayed.
   * @returns Whether the login heading is visible
   */
  async isLoginPageVisible(): Promise<boolean> {
    await this.returningCustomerHeading.waitFor({ state: "visible" });
    return this.returningCustomerHeading.isVisible();
  }

  /**
   * Submits customer credentials.
   * @param email - Customer email
   * @param password - Customer password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  /**
   * Checks whether the standard invalid-credentials warning is visible.
   * @returns Whether the warning is visible
   */
  async isInvalidCredentialsWarningVisible(): Promise<boolean> {
    return this.warningMessage.isVisible();
  }

  /**
   * Checks whether an OpenCart login error is visible.
   * @returns Whether an error alert is visible
   */
  async isLoginErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }

  /**
   * Checks whether browser-native input validation rejected the submitted form.
   * @returns Whether any form input is invalid
   */
  async isNativeValidationActive(): Promise<boolean> {
    return (await this.invalidInputs.count()) > 0;
  }
}
