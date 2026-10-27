import type { Locator, Page } from "@playwright/test";

export interface RegistrationDetails {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
}

export class RegistrationPage {
  private readonly page: Page;

  // Locators
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly telephoneField: Locator;
  private readonly passwordField: Locator;
  private readonly passwordConfirmationField: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly registrationHeading: Locator;
  private readonly accountCreatedHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names.
    this.firstNameField = page.getByLabel(/first name/i);
    this.lastNameField = page.getByLabel(/last name/i);
    this.emailField = page.getByLabel(/e-?mail/i);
    this.telephoneField = page.getByLabel(/telephone/i);
    this.passwordField = page.getByLabel(/password$/i);
    this.passwordConfirmationField = page.getByLabel(/password confirm/i);
    this.privacyPolicyCheckbox = page.getByRole("checkbox");
    this.continueButton = page.getByRole("button", { name: /^continue$/i });
    this.registrationHeading = page.getByRole("heading", { name: /register account/i });
    this.accountCreatedHeading = page.getByRole("heading", {
      name: /your account has been created/i,
    });
  }

  /**
   * Checks that the registration page is displayed.
   * @returns Whether the registration page heading is visible
   */
  async isRegistrationPageVisible(): Promise<boolean> {
    await this.registrationHeading.waitFor({ state: "visible" });
    return this.registrationHeading.isVisible();
  }

  /**
   * Submits a new customer registration.
   * @param customer - New customer details
   */
  async register(customer: RegistrationDetails): Promise<void> {
    await this.firstNameField.fill(customer.firstName);
    await this.lastNameField.fill(customer.lastName);
    await this.emailField.fill(customer.email);
    await this.telephoneField.fill(customer.telephone);
    await this.passwordField.fill(customer.password);
    await this.passwordConfirmationField.fill(customer.password);
    await this.privacyPolicyCheckbox.check();
    await this.continueButton.click();
  }

  /**
   * Checks for the account-created confirmation.
   * @returns Whether the success heading is visible
   */
  async isAccountCreated(): Promise<boolean> {
    await this.accountCreatedHeading.waitFor({ state: "visible" });
    return this.accountCreatedHeading.isVisible();
  }
}
