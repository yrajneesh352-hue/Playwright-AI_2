import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { generateUserPayload } from "../../utils/dataGenerator";

dotenv.config();

interface ApiUser {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address: {
    geolocation: { lat: string; long: string };
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
  phone: string;
}

test.describe("Users API Tests", () => {
  // Configuration
  const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);

  // GET
  test("GET - All users @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), "Get all users should return HTTP 200").toBe(200);

    const users: ApiUser[] = await response.json();
    expect(Array.isArray(users), "Users response should be an array").toBeTruthy();
    expect(users.length, "At least one user should be returned").toBeGreaterThan(0);
  });

  test("GET - User by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Get user by ID should return HTTP 200").toBe(200);

    const user: ApiUser = await response.json();
    expect(user.id, "Returned user id should match the requested id").toBe(USER_ID);
  });

  test("GET - Users with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USERS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited user request should return HTTP 200").toBe(200);

    const users: ApiUser[] = await response.json();
    expect(Array.isArray(users), "Users response should be an array").toBeTruthy();
    expect(users.length, "User count should match the requested limit").toBe(LIMIT);
  });

  for (const order of ["asc", "desc"] as const) {
    test(`GET - Users sorted ${order} @master @sanity @api`, async ({ request }) => {
      const route = Routes.GET_USERS_SORTED.replace("{order}", order);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), `Sorted user request (${order}) should return HTTP 200`).toBe(
        200,
      );

      const users: ApiUser[] = await response.json();
      const ids = users.map((user) => user.id);
      const sortedIds = [...ids].sort((left, right) =>
        order === "asc" ? left - right : right - left,
      );
      expect(ids, `User ids should be sorted ${order}`).toEqual(sortedIds);
    });
  }

  // CRUD
  test("POST - Create user @master @regression @api", async ({ request }) => {
    const payload = generateUserPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: payload,
    });
    expect(response.status(), "Create user should return HTTP 201").toBe(201);

    const created: { id: number } = await response.json();
    expect(typeof created.id, "Created user should have a numeric id").toBe("number");
    expect(created.id, "Created user id should be positive").toBeGreaterThan(0);

    const deleteRoute = Routes.DELETE_USER.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Created test user should be cleaned up").toBe(200);
  });

  test("PUT - Update user @master @regression @api", async ({ request }) => {
    const payload = generateUserPayload();
    payload.name.firstname = `${payload.name.firstname} Updated`;
    const route = Routes.UPDATE_USER.replace("{id}", String(USER_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Update user should return HTTP 200").toBe(200);

    const updated: Omit<ApiUser, "id"> & { id?: number } = await response.json();
    expect(updated.email, "Updated email should match the request").toBe(payload.email);
    expect(updated.username).toBe(payload.username);
    expect(updated.name.firstname).toBe(payload.name.firstname);
    expect(updated.name.lastname).toBe(payload.name.lastname);
    expect(updated.phone).toBe(payload.phone);
    expect(updated.address.city).toBe(payload.address.city);
  });

  test("DELETE - User @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_USER.replace("{id}", String(USER_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Delete user should return HTTP 200").toBe(200);
    const deleted: ApiUser = await response.json();
    expect(deleted.id, "Delete response should identify the requested user").toBe(USER_ID);
  });
});
