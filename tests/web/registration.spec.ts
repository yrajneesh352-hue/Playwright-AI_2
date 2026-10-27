import { test, expect } from "../../fixtures/pageFixtures";
import { generateUser } from "../../utils/dataGenerator";

test("Customer registration succeeds @master @sanity @regression @web", async ({
  homePage,
  registrationPage,
  accountPage,
}) => {
  const customer = generateUser();

  await test.step("1) Navigate to My Account > Register", async () => {
    await homePage.goToRegistration();
    expect(await registrationPage.isRegistrationPageVisible()).toBeTruthy();
  });

  await test.step("2) Submit valid registration details and accept the Privacy Policy", async () => {
    await registrationPage.register(customer);
  });

  await test.step("3) Verify the account-created confirmation", async () => {
    expect(await registrationPage.isAccountCreated()).toBeTruthy();
  });

  await test.step("4) Verify the new account is available through account navigation", async () => {
    await homePage.goToAccount();
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  console.log("Registration flow completed successfully.");
});
