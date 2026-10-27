import { test, expect } from "../../fixtures/pageFixtures";
import { readTestData } from "../../utils/DataReader";

interface LoginTestData {
  testName: string;
  email: string;
  password: string;
  expected: "success" | "failure";
}

const loginScenarios = readTestData<LoginTestData>(
  "testdata/opencart_logindata.json",
);

for (const [index, scenario] of loginScenarios.entries()) {
  test(`${scenario.testName} login data row ${index + 1} @master @regression @web @datadriven`, async ({
    homePage,
    loginPage,
    accountPage,
    page,
  }) => {
    await test.step("1) Navigate to the login page", async () => {
      await homePage.goToLogin();
      expect(await loginPage.isLoginPageVisible()).toBeTruthy();
    });

    await test.step("2) Submit the credentials from the data row", async () => {
      const email = scenario.email.trim() ? scenario.email : "";
      const password = scenario.password.trim() ? scenario.password : "";
      await loginPage.login(email, password);
    });

    if (scenario.expected === "success") {
      await test.step("3) Verify successful login and the My Account page", async () => {
        await expect(page).toHaveURL(/route=account\/account/);
        expect(await accountPage.isDashboardVisible()).toBeTruthy();
      });
    } else {
      await test.step("3) Verify failed login and the application warning", async () => {
        await expect(page).toHaveURL(/route=account\/login/);
        expect(await loginPage.isInvalidCredentialsWarningVisible()).toBeTruthy();
      });
    }

    console.log(`Data-driven login scenario completed: ${scenario.testName}`);
  });
}
