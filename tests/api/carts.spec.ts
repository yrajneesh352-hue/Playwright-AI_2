import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { generateCartPayload } from "../../utils/dataGenerator";

dotenv.config();

interface ApiCart {
  id: number;
  userId: number;
  date: string;
  products: Array<{ productId: number; quantity: number }>;
}

test.describe("Carts API Tests", () => {
  // Configuration
  const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const CART_ID = Number(process.env.CART_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);
  const START_DATE = process.env.START_DATE ?? "2019-12-10";
  const END_DATE = process.env.END_DATE ?? "2020-10-10";

  // GET
  test("GET - All carts @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), "Get all carts should return HTTP 200").toBe(200);

    const carts: ApiCart[] = await response.json();
    expect(Array.isArray(carts), "Carts response should be an array").toBeTruthy();
    expect(carts.length, "At least one cart should be returned").toBeGreaterThan(0);
  });

  test("GET - Cart by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Get cart by ID should return HTTP 200").toBe(200);

    const cart: ApiCart = await response.json();
    expect(cart.id, "Returned cart id should match the requested id").toBe(CART_ID);
  });

  test("GET - Carts by date range @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace("{startdate}", encodeURIComponent(START_DATE))
      .replace("{enddate}", encodeURIComponent(END_DATE));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Date-range cart request should return HTTP 200").toBe(200);

    const carts: ApiCart[] = await response.json();
    expect(Array.isArray(carts), "Date-range response should be an array").toBeTruthy();
    const start = Date.parse(START_DATE);
    const end = Date.parse(`${END_DATE}T23:59:59.999Z`);
    for (const cart of carts) {
      const cartDate = Date.parse(cart.date);
      expect(
        cartDate,
        `Cart ${cart.id} date should be within the requested range`,
      ).toBeGreaterThanOrEqual(start);
      expect(
        cartDate,
        `Cart ${cart.id} date should be within the requested range`,
      ).toBeLessThanOrEqual(end);
    }
  });

  test("GET - Carts for a user @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USER_CART.replace("{userId}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Get user carts should return HTTP 200").toBe(200);

    const carts: ApiCart[] = await response.json();
    expect(Array.isArray(carts), "User carts response should be an array").toBeTruthy();
    for (const cart of carts) {
      expect(cart.userId, "Each cart should belong to the requested user").toBe(USER_ID);
    }
  });

  test("GET - Carts with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CARTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited cart request should return HTTP 200").toBe(200);

    const carts: ApiCart[] = await response.json();
    expect(Array.isArray(carts), "Carts response should be an array").toBeTruthy();
    expect(carts.length, "Cart count should match the requested limit").toBe(LIMIT);
  });

  for (const order of ["asc", "desc"] as const) {
    test(`GET - Carts sorted ${order} @master @sanity @api`, async ({ request }) => {
      const route = Routes.GET_CARTS_SORTED.replace("{order}", order);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), `Sorted cart request (${order}) should return HTTP 200`).toBe(
        200,
      );

      const carts: ApiCart[] = await response.json();
      const ids = carts.map((cart) => cart.id);
      const sortedIds = [...ids].sort((left, right) =>
        order === "asc" ? left - right : right - left,
      );
      expect(ids, `Cart ids should be sorted ${order}`).toEqual(sortedIds);
    });
  }

  // CRUD
  test("POST - Create cart @master @regression @api", async ({ request }) => {
    const payload = generateCartPayload(USER_ID, PRODUCT_ID, 1);
    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: payload,
    });
    expect(response.status(), "Create cart should return HTTP 201").toBe(201);

    const created: ApiCart = await response.json();
    expect(created.id, "Created cart should have a positive id").toBeGreaterThan(0);
    expect(created.userId, "Created cart should retain the requested user id").toBe(
      payload.userId,
    );
    expect(created.products, "Created cart should retain the submitted products").toEqual(
      payload.products,
    );

    const deleteRoute = Routes.DELETE_CART.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Created test cart should be cleaned up").toBe(200);
  });

  test("PUT - Update cart @master @regression @api", async ({ request }) => {
    const payload = generateCartPayload(USER_ID, PRODUCT_ID, 2);
    const route = Routes.UPDATE_CART.replace("{id}", String(CART_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Update cart should return HTTP 200").toBe(200);

    const updated: ApiCart = await response.json();
    expect(updated.id, "Updated cart id should match the requested id").toBe(CART_ID);
    expect(updated.userId).toBe(payload.userId);
    expect(updated.products, "Updated cart should contain the requested quantity").toEqual(
      payload.products,
    );
  });

  test("DELETE - Cart @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_CART.replace("{id}", String(CART_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Delete cart should return HTTP 200").toBe(200);
    const deleted: ApiCart = await response.json();
    expect(deleted.id, "Delete response should identify the requested cart").toBe(CART_ID);
  });
});
