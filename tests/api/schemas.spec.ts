import { test, expect } from "@playwright/test";
import Ajv, { type AnySchema } from "ajv";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { readJson } from "../../utils/DataReader";

dotenv.config();

test.describe("API Response Schema Tests", () => {
  // Configuration
  const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const CART_ID = Number(process.env.CART_ID ?? 1);
  const ajv = new Ajv();

  test("GET - Validate product response schema @master @sanity @api", async ({
    request,
  }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Product schema request should return HTTP 200").toBe(200);

    const product: unknown = await response.json();
    const schema = readJson<AnySchema>("api/schemas/product_api_schema.json");
    const validate = ajv.compile(schema);
    const isValid = validate(product);
    expect(
      isValid,
      `Product response schema validation failed: ${JSON.stringify(validate.errors)}`,
    ).toBeTruthy();
  });

  test("GET - Validate user response schema @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "User schema request should return HTTP 200").toBe(200);

    const user: unknown = await response.json();
    const schema = readJson<AnySchema>("api/schemas/user_api_schema.json");
    const validate = ajv.compile(schema);
    const isValid = validate(user);
    expect(
      isValid,
      `User response schema validation failed: ${JSON.stringify(validate.errors)}`,
    ).toBeTruthy();
  });

  test("GET - Validate cart response schema @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Cart schema request should return HTTP 200").toBe(200);

    const cart: unknown = await response.json();
    const schema = readJson<AnySchema>("api/schemas/cart_api_schema.json");
    const validate = ajv.compile(schema);
    const isValid = validate(cart);
    expect(
      isValid,
      `Cart response schema validation failed: ${JSON.stringify(validate.errors)}`,
    ).toBeTruthy();
  });
});
