import { test, expect } from "../../fixtures/pageFixtures";
import { getRequiredEnv } from "../../utils/helper";

test("Product can be added to the shopping cart @master @sanity @regression @web", async ({
  homePage,
  searchResultsPage,
  productPage,
  shoppingCartPage,
}) => {
  const productName = getRequiredEnv("CART_PRODUCT_NAME");
  const quantity = Number(getRequiredEnv("PRODUCT_QUANTITY"));

  await test.step("1) Search for the configured available product", async () => {
    await homePage.searchFor(productName);
    expect(await searchResultsPage.isResultsPageVisible()).toBeTruthy();
    expect(await searchResultsPage.hasProduct(productName)).toBeTruthy();
  });

  await test.step("2) Open the product details and set the requested quantity", async () => {
    await searchResultsPage.openProduct(productName);
    expect(await productPage.isProductVisible(productName)).toBeTruthy();
    await productPage.setQuantity(quantity);
  });

  await test.step("3) Add the product to the cart and verify the confirmation", async () => {
    await productPage.addToCart();
    const confirmation = await productPage.getAddToCartMessage();
    expect(confirmation).toContain("Success: You have added");
    expect(confirmation).toContain(productName);
  });

  await test.step("4) Verify the product and quantity in the shopping cart", async () => {
    await homePage.openShoppingCart();
    expect(await shoppingCartPage.isCartVisible()).toBeTruthy();
    expect(await shoppingCartPage.hasProduct(productName)).toBeTruthy();
    expect(await shoppingCartPage.getQuantity(productName)).toBe(String(quantity));
  });

  console.log("Product add-to-cart flow completed successfully.");
});
