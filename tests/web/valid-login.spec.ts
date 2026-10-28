import { test, expect } from "../../fixtures/pageFixtures";
import { getValidLoginCredentials } from "../../utils/loginTestData";

test("Customer login succeeds with configured credentials @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  accountPage,
  page,
}) => {
  const { email, password } = getValidLoginCredentials();

  await test.step("1) Navigate to My Account > Login", async () => {
    await homePage.goToLogin();
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();
  });

  await test.step("2) Log in using the configured customer credentials", async () => {
    await loginPage.login(email, password);
  });

  await test.step("3) Verify redirect to the My Account section", async () => {
    await expect(page).toHaveURL(/route=account\/account/);
  });

  await test.step("4) Verify the authenticated account dashboard", async () => {
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  console.log("Customer login flow completed successfully.");
});
