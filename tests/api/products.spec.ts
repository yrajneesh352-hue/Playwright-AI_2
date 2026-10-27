import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { generateProductPayload } from "../../utils/dataGenerator";

dotenv.config();

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
}

test.describe("Products API Tests", () => {
  // Configuration
  const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);
  const CATEGORY = "electronics";

  // GET
  test("GET - All products @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), "Get all products should return HTTP 200").toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), "Products response should be an array").toBeTruthy();
    expect(products.length, "At least one product should be returned").toBeGreaterThan(0);

    for (const product of products) {
      expect(typeof product.id, "Product id should be a number").toBe("number");
      expect(typeof product.title, "Product title should be a string").toBe("string");
      expect(typeof product.price, "Product price should be a number").toBe("number");
      expect(typeof product.category, "Product category should be a string").toBe("string");
      expect(typeof product.image, "Product image should be a string").toBe("string");
    }
  });

  test("GET - Product by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Get product by ID should return HTTP 200").toBe(200);

    const product: Product = await response.json();
    expect(product.id, "Returned product id should match the requested id").toBe(
      PRODUCT_ID,
    );
    expect(typeof product.title, "Product title should be a string").toBe("string");
    expect(typeof product.price, "Product price should be a number").toBe("number");
    expect(typeof product.category, "Product category should be a string").toBe("string");
    expect(typeof product.image, "Product image should be a string").toBe("string");
  });

  test("GET - Products with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited product request should return HTTP 200").toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), "Products response should be an array").toBeTruthy();
    expect(products.length, "Product count should match the requested limit").toBe(LIMIT);
  });

  for (const order of ["asc", "desc"] as const) {
    test(`GET - Products sorted ${order} @master @sanity @api`, async ({ request }) => {
      const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", order);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), `Sorted product request (${order}) should return HTTP 200`).toBe(
        200,
      );

      const products: Product[] = await response.json();
      const ids = products.map((product) => product.id);
      const sortedIds = [...ids].sort((left, right) =>
        order === "asc" ? left - right : right - left,
      );
      expect(ids, `Product ids should be sorted ${order}`).toEqual(sortedIds);
    });
  }

  test("GET - All product categories @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), "Get all categories should return HTTP 200").toBe(200);

    const categories: string[] = await response.json();
    expect(Array.isArray(categories), "Categories response should be an array").toBeTruthy();
    expect(categories.length, "At least one category should be returned").toBeGreaterThan(0);
  });

  test("GET - Products by category @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace(
      "{category}",
      encodeURIComponent(CATEGORY),
    );
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Get products by category should return HTTP 200").toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), "Category response should be an array").toBeTruthy();
    expect(products.length, "Category should contain at least one product").toBeGreaterThan(
      0,
    );
    for (const product of products) {
      expect(product.category, "Each product should belong to the requested category").toBe(
        CATEGORY,
      );
    }
  });

  // CRUD
  test("POST - Create product @master @regression @api", async ({ request }) => {
    const payload = generateProductPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: payload,
    });
    expect(response.status(), "Create product should return HTTP 201").toBe(201);

    const created: Product = await response.json();
    expect(typeof created.id, "Created product should have a numeric id").toBe("number");
    expect(created.id, "Created product id should be positive").toBeGreaterThan(0);
    expect(created.title, "Created product title should match the request").toBe(
      payload.title,
    );
    expect(created.price, "Created product price should match the request").toBe(
      payload.price,
    );
    expect(created.description).toBe(payload.description);
    expect(created.category).toBe(payload.category);
    expect(created.image).toBe(payload.image);

    const deleteRoute = Routes.DELETE_PRODUCT.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Created test product should be cleaned up").toBe(200);
  });

  test("PUT - Update product @master @regression @api", async ({ request }) => {
    const payload = generateProductPayload();
    payload.title = `${payload.title} Updated`;
    const route = Routes.UPDATE_PRODUCT.replace("{id}", String(PRODUCT_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Update product should return HTTP 200").toBe(200);

    const updated: Product = await response.json();
    expect(updated.id, "Updated product id should match the requested id").toBe(PRODUCT_ID);
    expect(updated.title, "Updated product title should match the request").toBe(
      payload.title,
    );
    expect(updated.price).toBe(payload.price);
    expect(updated.description).toBe(payload.description);
    expect(updated.category).toBe(payload.category);
    expect(updated.image).toBe(payload.image);
  });

  test("DELETE - Product @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_PRODUCT.replace("{id}", String(PRODUCT_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Delete product should return HTTP 200").toBe(200);
    const deleted: Product = await response.json();
    expect(deleted.id, "Delete response should identify the requested product").toBe(
      PRODUCT_ID,
    );
  });
});
