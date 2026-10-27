import dotenv from "dotenv";
import { test as base, expect } from "@playwright/test";
import { AccountPage } from "../pages/AccountPage";
import { AdminCustomersPage } from "../pages/AdminCustomersPage";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { LogoutPage } from "../pages/LogoutPage";
import { ProductPage } from "../pages/ProductPage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { SearchResultsPage } from "../pages/SearchResultsPage";
import { ShoppingCartPage } from "../pages/ShoppingCartPage";
import { getRequiredEnv } from "../utils/helper";

dotenv.config();

const appUrl = getRequiredEnv("WEB_APP_URL");

type PageFixtures = {
  adminCustomersPage: AdminCustomersPage;
  adminLoginPage: AdminLoginPage;
  homePage: HomePage;
  registrationPage: RegistrationPage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  logoutPage: LogoutPage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  shoppingCartPage: ShoppingCartPage;
};

export const test = base.extend<PageFixtures>({
  adminCustomersPage: async ({ page }, use) => {
    await use(new AdminCustomersPage(page));
  },
  adminLoginPage: async ({ page }, use) => {
    await use(new AdminLoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await page.goto(appUrl);
    await use(new HomePage(page));
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  logoutPage: async ({ page }, use) => {
    await use(new LogoutPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  shoppingCartPage: async ({ page }, use) => {
    await use(new ShoppingCartPage(page));
  },
});

test.afterEach(async ({ page, context }) => {
  if (!page.isClosed()) {
    await page.close();
  }
  await context.close();
});

export { expect };
