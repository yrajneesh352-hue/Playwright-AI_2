import { test, expect } from "../../fixtures/pageFixtures";
import { getRequiredEnv } from "../../utils/helper";

test("Product search returns the expected product @master @sanity @regression @web", async ({
  homePage,
  searchResultsPage,
}) => {
  const productName = getRequiredEnv("PRODUCT_NAME");

  await test.step("1) Search for the configured product", async () => {
    await homePage.searchFor(productName);
  });

  await test.step("2) Verify the search results page is displayed", async () => {
    expect(await searchResultsPage.isResultsPageVisible()).toBeTruthy();
  });

  await test.step("3) Verify the exact product name appears in the results", async () => {
    expect(await searchResultsPage.hasProduct(productName)).toBeTruthy();
  });

  console.log("Product search flow completed successfully.");
});
