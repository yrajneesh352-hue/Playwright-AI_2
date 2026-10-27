import dotenv from "dotenv";
import { type ResultSetHeader, type RowDataPacket } from "mysql2";
import { test, expect } from "../../fixtures/pageFixtures";
import { HomePage } from "../../pages/HomePage";
import { generateUser } from "../../utils/dataGenerator";
import { closeDbConnection, query } from "../../utils/dbClient";
import { getRequiredEnv } from "../../utils/helper";

dotenv.config();

interface CustomerRecord extends RowDataPacket {
  firstname: string;
  lastname: string;
  email: string;
  status: number;
  date_added?: Date | string | null;
}

const frontendUrl = process.env.APP_URL?.trim() || getRequiredEnv("WEB_APP_URL");
const adminUrl =
  process.env.OPENCART_ADMIN_URL ??
  "http://localhost/opencart/upload/admin/index.php";
const adminUsername = getRequiredEnv("ADMIN_USERNAME");
const adminPassword = getRequiredEnv("ADMIN_PASSWORD");
const expectedCustomerStatus = 1;

test("New customer is consistent in storefront, admin, and database @master @regression @db @web", async ({
  page,
  registrationPage,
  adminLoginPage,
  adminCustomersPage,
}) => {
  const customer = generateUser();

  await test.step("Register a unique customer through the storefront", async () => {
    await page.goto(frontendUrl);
    await new HomePage(page).goToRegistration();
    expect(
      await registrationPage.isRegistrationPageVisible(),
      "The customer registration page should be displayed",
    ).toBeTruthy();

    await registrationPage.register(customer);
    expect(
      await registrationPage.isAccountCreated(),
      "The storefront should confirm that the customer account was created",
    ).toBeTruthy();
  });

  await test.step("Find and validate the customer in the admin portal", async () => {
    await adminLoginPage.open(adminUrl);
    await adminLoginPage.login(adminUsername, adminPassword);
    expect(
      await adminLoginPage.isAuthenticated(),
      "The administrator should be authenticated before customer search",
    ).toBeTruthy();

    await adminCustomersPage.openCustomerList();
    const customerRow = await adminCustomersPage.searchByEmail(customer.email);
    await expect(
      customerRow,
      "The newly registered customer should appear in the admin customer list",
    ).toContainText(customer.firstName);
    await expect(customerRow).toContainText(customer.lastName);
    await expect(customerRow).toContainText(customer.email);
    await expect(
      customerRow.getByText("Enabled", { exact: true }),
      "A newly registered customer should be enabled in the admin portal",
    ).toBeVisible();
  });

  await test.step("Validate the same customer record in MySQL", async () => {
    let customerRecordFound = false;

    try {
      const dateAddedColumns = await query<RowDataPacket[]>(
        "SHOW COLUMNS FROM `oc_customer` LIKE ?",
        ["date_added"],
      );
      const hasDateAdded = dateAddedColumns.length > 0;
      const optionalDateColumn = hasDateAdded ? ", `date_added`" : "";
      const records = await query<CustomerRecord[]>(
        `SELECT \`firstname\`, \`lastname\`, \`email\`, \`status\`${optionalDateColumn} FROM \`oc_customer\` WHERE \`email\` = ?`,
        [customer.email],
      );
      customerRecordFound = records.length === 1;

      expect(
        records,
        "Exactly one database record should match the newly registered email",
      ).toHaveLength(1);

      const [record] = records;
      expect(record.firstname, "Database first name should match the registration").toBe(
        customer.firstName,
      );
      expect(record.lastname, "Database last name should match the registration").toBe(
        customer.lastName,
      );
      expect(record.email, "Database email should match the registration").toBe(
        customer.email,
      );
      expect(
        record.status,
        "A newly registered customer should have the expected enabled status",
      ).toBe(expectedCustomerStatus);

      if (hasDateAdded) {
        expect(
          record.date_added,
          "The customer date_added value should be populated when the column exists",
        ).toBeTruthy();
      }
    } finally {
      try {
        if (customerRecordFound) {
          const cleanup = await query<ResultSetHeader>(
            "DELETE FROM `oc_customer` WHERE `email` = ?",
            [customer.email],
          );
          expect(
            cleanup.affectedRows,
            "The temporary customer database record should be cleaned up",
          ).toBe(1);
        }
      } finally {
        await closeDbConnection();
      }
    }
  });
});
