import { test, expect } from "../../fixtures/pageFixtures";
import { getRequiredEnv } from "../../utils/helper";

test("Customer can log out successfully @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  accountPage,
  logoutPage,
  page,
}) => {
  const email = getRequiredEnv("APP_EMAIL");
  const password = getRequiredEnv("APP_PASSWORD");

  await test.step("1) Log in using valid customer credentials", async () => {
    await homePage.goToLogin();
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();
    await loginPage.login(email, password);
    await expect(page).toHaveURL(/route=account\/account/);
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  await test.step("2) Navigate to the account logout option and log out", async () => {
    expect(await homePage.isLogoutOptionVisible()).toBeTruthy();
    await accountPage.logout();
  });

  await test.step("3) Verify the logout confirmation and continue", async () => {
    expect(await logoutPage.isLogoutConfirmationVisible()).toBeTruthy();
    await logoutPage.continueToStorefront();
  });

  await test.step("4) Verify return to the storefront without authenticated options", async () => {
    await expect(page).toHaveURL(/route=common\/home/);
    expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
  });

  console.log("Customer logout flow completed successfully.");
});
