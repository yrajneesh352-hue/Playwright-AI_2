import type { Locator, Page } from "@playwright/test";

export class AdminCustomersPage {
  private readonly page: Page;
  private readonly customerMenu: Locator;
  private readonly customerListLink: Locator;
  private readonly emailFilter: Locator;
  private readonly filterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.customerMenu = page.locator("#menu-customer > a");
    this.customerListLink = page.locator(
      '#menu-customer a[href*="route=customer/customer"]',
    );
    this.emailFilter = page.locator("#input-email");
    this.filterButton = page.locator("#button-filter");
  }

  async openCustomerList(): Promise<void> {
    await this.customerMenu.click();
    await this.customerListLink.click();
    await this.emailFilter.waitFor({ state: "visible" });
  }

  async searchByEmail(email: string): Promise<Locator> {
    await this.emailFilter.fill(email);
    await this.filterButton.click();

    const customerRow = this.page
      .locator("#form-customer tbody tr")
      .filter({ hasText: email });
    await customerRow.waitFor({ state: "visible" });
    return customerRow;
  }
}
