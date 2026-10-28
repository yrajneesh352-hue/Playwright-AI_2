import { test, expect } from "../../fixtures/pageFixtures";

test("Invalid customer login is rejected @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  page,
}) => {
  await test.step("1) Navigate to My Account > Login", async () => {
    await homePage.goToLogin();
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();
  });

  await test.step("2) Submit invalid customer credentials", async () => {
    await loginPage.login("invalid-login-test@example.invalid", "InvalidPassword123!");
  });

  await test.step("3) Verify a login error and failed authentication", async () => {
    expect(await loginPage.isLoginErrorVisible()).toBeTruthy();
    await expect(page).toHaveURL(/route=account\/login/);
  });

  await test.step("4) Verify authenticated account options are unavailable", async () => {
    expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
  });

  console.log("Invalid login was rejected as expected.");
});
