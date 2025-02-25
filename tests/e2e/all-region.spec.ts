import test, { expect } from "@playwright/test";

test.describe("All Regions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User clicks link page of all regions and sees a table of all regions", async ({
    page,
  }) => {
    await page.click('a[href="/regions"]');

    await expect(page).toHaveURL("/regions");

    const table = page.locator("table");
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    await expect(rows).toHaveCount(20);

    await expect(rows.first().locator("td").nth(1)).toContainText("Aceh");
  });

  test("User clicks next page and sees next 20 data of all regions", async ({
    page,
  }) => {
    await page.click('a[href="/regions"]');

    await page.getByRole("button", { name: "Next" }).click();
    await page.waitForTimeout(500);

    const table = page.locator("table");
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    await expect(rows).toHaveCount(20);
  });

  test("User search region and see the result region searched", async ({
    page,
  }) => {
    await page.click('a[href="/regions"]');

    await page.getByPlaceholder("Cari wilayah...").fill("jakarta selatan");
    await page.waitForTimeout(500);

    const table = page.locator("table");
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    await expect(rows).toHaveCount(1);
  });
});
