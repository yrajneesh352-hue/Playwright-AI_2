import { test, expect } from "../../fixtures/pageFixtures";
import { generateUser } from "../../utils/dataGenerator";
import { getRequiredEnv } from "../../utils/helper";

test("Customer completes the end-to-end shopping journey @master @sanity @regression @web", async ({
  homePage,
  registrationPage,
  loginPage,
  accountPage,
  logoutPage,
  searchResultsPage,
  productPage,
  shoppingCartPage,
  page,
}) => {
  test.setTimeout(60_000);

  const customer = generateUser();
  const productName = getRequiredEnv("CART_PRODUCT_NAME");
  const quantity = Number(getRequiredEnv("PRODUCT_QUANTITY"));
  let productPrice = "";

  await test.step("1) Register a new customer with unique details", async () => {
    await homePage.goToRegistration();
    expect(await registrationPage.isRegistrationPageVisible()).toBeTruthy();
    await registrationPage.register(customer);
    expect(await registrationPage.isAccountCreated()).toBeTruthy();
  });

  await test.step("2) Log out and verify the logout confirmation", async () => {
    await accountPage.logout();
    expect(await logoutPage.isLogoutConfirmationVisible()).toBeTruthy();
    await logoutPage.continueToStorefront();
  });

  await test.step("3) Log in again using the newly registered credentials", async () => {
    await homePage.goToLogin();
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();
    await loginPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/route=account\/account/);
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  await test.step("4) Search for the product and open its details", async () => {
    await homePage.searchFor(productName);
    expect(await searchResultsPage.isResultsPageVisible()).toBeTruthy();
    expect(await searchResultsPage.hasProduct(productName)).toBeTruthy();
    await searchResultsPage.openProduct(productName);
    expect(await productPage.isProductVisible(productName)).toBeTruthy();
    productPrice = await productPage.getDisplayedPrice();
  });

  await test.step("5) Add the requested quantity and verify the confirmation", async () => {
    await productPage.setQuantity(quantity);
    await productPage.addToCart();
    const confirmation = await productPage.getAddToCartMessage();
    expect(confirmation).toContain("Success: You have added");
    expect(confirmation).toContain(productName);
  });

  await test.step("6) Verify cart product, quantity, price, and total", async () => {
    await homePage.openShoppingCart();
    expect(await shoppingCartPage.isCartVisible()).toBeTruthy();
    expect(await shoppingCartPage.hasProduct(productName)).toBeTruthy();
    expect(await shoppingCartPage.getQuantity(productName)).toBe(String(quantity));

    const unitPrice = await shoppingCartPage.getUnitPrice(productName);
    const lineTotal = await shoppingCartPage.getLineTotal(productName);
    const cartTotal = await shoppingCartPage.getCartTotal();
    expect(unitPrice.trim()).toBe(productPrice);
    expect(cartTotal).toBe(lineTotal);
  });

  console.log("End-to-end shopping journey completed successfully.");
});
