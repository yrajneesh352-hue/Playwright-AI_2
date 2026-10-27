import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";

dotenv.config();
const configuredEnv = dotenv.parse(readFileSync(".env", "utf8"));

test.describe("Authentication API Tests", () => {
  // Configuration
  const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
  const USERNAME =
    process.env.API_USERNAME ?? configuredEnv.USERNAME ?? process.env.USERNAME ?? "";
  const PASSWORD =
    process.env.API_PASSWORD ?? configuredEnv.PASSWORD ?? process.env.PASSWORD ?? "";

  test("POST - Login with valid credentials @master @sanity @api", async ({ request }) => {
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: USERNAME, password: PASSWORD },
    });

    expect(response.status(), "Valid login should return HTTP 201").toBe(201);

    const responseBody: { token?: unknown } = await response.json();
    expect(responseBody, "Login response should include a token property").toHaveProperty(
      "token",
    );
    expect(typeof responseBody.token, "Authentication token should be a string").toBe(
      "string",
    );
    if (typeof responseBody.token !== "string") {
      throw new TypeError("Authentication response token must be a string.");
    }
    expect(
      responseBody.token.length,
      "Authentication token should not be empty",
    ).toBeGreaterThan(0);
  });

  test("POST - Login with invalid credentials @master @regression @api", async ({
    request,
  }) => {
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: "invalid-user", password: "invalid-password" },
    });

    expect(response.status(), "Invalid login should return HTTP 401").toBe(401);

    const errorMessage = await response.text();
    expect(errorMessage, "API should return the expected invalid-credentials error").toBe(
      "username or password is incorrect",
    );
  });
});
