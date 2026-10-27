import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import {
  generateCartPayload,
  generateProductPayload,
  generateUserPayload,
} from "../../utils/dataGenerator";

dotenv.config();

test.describe.serial("API CRUD Workflow Tests", () => {
  // Configuration
  const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);

  test("POST - PUT - DELETE product workflow @master @regression @api", async ({
    request,
  }) => {
    const payload = generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: payload,
    });
    expect(createResponse.status(), "Workflow product create should return HTTP 201").toBe(
      201,
    );

    const created: { id: number } = await createResponse.json();
    expect(created.id, "Created product id should be positive").toBeGreaterThan(0);

    const updatedPayload = { ...payload, title: `${payload.title} Updated` };
    const updateRoute = Routes.UPDATE_PRODUCT.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatedPayload,
    });
    expect(updateResponse.status(), "Workflow product update should return HTTP 200").toBe(
      200,
    );
    const updated: { id: number; title: string; price: number } =
      await updateResponse.json();
    expect(updated.id, "Update should use the product id returned from create").toBe(
      created.id,
    );
    expect(updated.title, "Updated product title should be returned").toBe(
      updatedPayload.title,
    );
    expect(updated.price).toBe(updatedPayload.price);

    const deleteRoute = Routes.DELETE_PRODUCT.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Workflow product delete should return HTTP 200").toBe(
      200,
    );
  });

  test("POST - PUT - DELETE user workflow @master @regression @api", async ({
    request,
  }) => {
    const payload = generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: payload,
    });
    expect(createResponse.status(), "Workflow user create should return HTTP 201").toBe(
      201,
    );

    const created: { id: number } = await createResponse.json();
    expect(created.id, "Created user id should be positive").toBeGreaterThan(0);

    const updatedPayload = {
      ...payload,
      name: { ...payload.name, firstname: `${payload.name.firstname} Updated` },
    };
    const updateRoute = Routes.UPDATE_USER.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatedPayload,
    });
    expect(updateResponse.status(), "Workflow user update should return HTTP 200").toBe(
      200,
    );
    const updated: {
      email: string;
      username: string;
      name: { firstname: string; lastname: string };
    } = await updateResponse.json();
    expect(updated.email).toBe(updatedPayload.email);
    expect(updated.username).toBe(updatedPayload.username);
    expect(updated.name.firstname).toBe(updatedPayload.name.firstname);
    expect(updated.name.lastname).toBe(updatedPayload.name.lastname);

    const deleteRoute = Routes.DELETE_USER.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Workflow user delete should return HTTP 200").toBe(
      200,
    );
  });

  test("POST - PUT - DELETE cart workflow @master @regression @api", async ({
    request,
  }) => {
    const payload = generateCartPayload(USER_ID, PRODUCT_ID, 1);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: payload,
    });
    expect(createResponse.status(), "Workflow cart create should return HTTP 201").toBe(
      201,
    );

    const created: { id: number; userId: number; products: typeof payload.products } =
      await createResponse.json();
    expect(created.id, "Created cart id should be positive").toBeGreaterThan(0);
    expect(created.userId).toBe(payload.userId);
    expect(created.products).toEqual(payload.products);

    const updatedPayload = generateCartPayload(
      USER_ID,
      PRODUCT_ID,
      payload.products[0].quantity + 1,
    );
    const updateRoute = Routes.UPDATE_CART.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatedPayload,
    });
    expect(updateResponse.status(), "Workflow cart update should return HTTP 200").toBe(
      200,
    );
    const updated: { id: number; products: typeof payload.products } =
      await updateResponse.json();
    expect(updated.id, "Update should use the cart id returned from create").toBe(
      created.id,
    );
    expect(updated.products).toEqual(updatedPayload.products);

    const deleteRoute = Routes.DELETE_CART.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Workflow cart delete should return HTTP 200").toBe(
      200,
    );
  });
});
